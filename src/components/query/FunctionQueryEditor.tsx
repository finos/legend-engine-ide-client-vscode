/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react';
import { flowResult } from 'mobx';
import {
  type Entity,
  type QueryBuilderState,
  assertTrue,
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  FunctionQueryBuilderState,
  guaranteeNonNullable,
  guaranteeType,
  PackageableElementExplicitReference,
  QueryBuilder,
  RawLambda,
  useApplicationStore,
  V1_buildVariable,
  V1_ConcreteFunctionDefinition,
  V1_deserializePackageableElement,
  V1_GraphBuilderContextBuilder,
  V1_PureGraphManager,
} from '@finos/legend-vscode-extension-dependencies';
import {
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  LEGEND_REFRESH_QUERY_BUILDER,
} from '../../utils/Const';
import { postMessage } from '../../utils/VsCodeUtils';
import { QueryBuilderVSCodeWorkflowState } from './QueryBuilderWorkflowState';
import { type LegendVSCodeApplicationConfig } from '../../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';
import { buildGraphManagerStateFromEntities } from '../../utils/GraphUtils';

export const FunctionQueryEditor: React.FC<{
  functionId: string;
}> = ({ functionId }) => {
  const applicationStore = useApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >();
  const [currentFunctionId, setCurrentFunctionId] = useState(functionId);
  const [queryBuilderState, setQueryBuilderState] =
    useState<QueryBuilderState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    postMessage({
      command: GET_PROJECT_ENTITIES,
    });
  }, [currentFunctionId]);

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<{ result: Entity[]; command: string }>,
    ): void => {
      const message = event.data;
      switch (message.command) {
        case GET_PROJECT_ENTITIES_RESPONSE: {
          const es: Entity[] = message.result;
          setEntities(es);
          break;
        }
        case LEGEND_REFRESH_QUERY_BUILDER: {
          setIsLoading(true);
          postMessage({
            command: GET_PROJECT_ENTITIES,
          });
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const buildGraphManagerStateAndInitializeQuery =
      async (): Promise<void> => {
        const graphManagerState = await buildGraphManagerStateFromEntities(
          entities,
          applicationStore,
        );
        const functionElement = graphManagerState.graph.getFunction(currentFunctionId);
        const newQueryBuilderState = new FunctionQueryBuilderState(
          applicationStore,
          graphManagerState,
          QueryBuilderVSCodeWorkflowState.INSTANCE,
          functionElement,
          undefined,
        );
        newQueryBuilderState.initializeWithQuery(
          new RawLambda(
            functionElement.parameters.map((_param) =>
              graphManagerState.graphManager.serializeRawValueSpecification(
                _param,
              ),
            ),
            functionElement.expressionSequence,
          ),
        );
        assertTrue(
          Boolean(
            newQueryBuilderState.isQuerySupported &&
              newQueryBuilderState.executionContextState.mapping &&
              newQueryBuilderState.executionContextState.runtimeValue,
          ),
          `Only functions returning TDS/graph fetch using the from() function can be edited via query builder`,
        );
        await flowResult(
          newQueryBuilderState.explorerState.analyzeMappingModelCoverage(),
        ).catch(applicationStore.alertUnhandledError);
        setQueryBuilderState(newQueryBuilderState);
      };

    const updateExistingQuery = (): void => {
      const nonNullQueryBuilderState = guaranteeNonNullable(queryBuilderState);
      const graphManager = guaranteeType(
        nonNullQueryBuilderState.graphManagerState.graphManager,
        V1_PureGraphManager,
        'Graph manager must be a V1_PureGraphManager',
      );

      // Get updated function entity
      const V1_functionDefinition = guaranteeType(
        V1_deserializePackageableElement(
          guaranteeNonNullable(
            entities.find((entity) => entity.path === currentFunctionId)?.content,
            `Unable to find function entity with ID ${currentFunctionId}`,
          ),
          applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
        ),
        V1_ConcreteFunctionDefinition,
      );

      // Get existing function element
      const existingFunctionElement =
        nonNullQueryBuilderState.graphManagerState.graph.getFunction(
          currentFunctionId,
        );

      // Update existing function element
      existingFunctionElement.name = V1_functionDefinition.name;
      existingFunctionElement.returnType =
        PackageableElementExplicitReference.create(
          nonNullQueryBuilderState.graphManagerState.graph.getType(
            V1_functionDefinition.returnType,
          ),
        );
      existingFunctionElement.returnMultiplicity =
        V1_functionDefinition.returnMultiplicity;
      existingFunctionElement.expressionSequence =
        V1_functionDefinition.body as object[];
      const context = new V1_GraphBuilderContextBuilder(
        nonNullQueryBuilderState.graphManagerState.graph,
        nonNullQueryBuilderState.graphManagerState.graph,
        graphManager.graphBuilderExtensions,
        graphManager.logService,
      ).build();
      existingFunctionElement.parameters = V1_functionDefinition.parameters.map(
        (e) => V1_buildVariable(e, context),
      );

      // Re-initialize query builder
      nonNullQueryBuilderState.initializeWithQuery(
        new RawLambda(
          existingFunctionElement.parameters.map((_param) =>
            nonNullQueryBuilderState.graphManagerState.graphManager.serializeRawValueSpecification(
              _param,
            ),
          ),
          existingFunctionElement.expressionSequence,
        ),
      );
    };
    if (entities.length && currentFunctionId && applicationStore) {
      try {
        if (queryBuilderState === null) {
          buildGraphManagerStateAndInitializeQuery();
        } else {
          updateExistingQuery();
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          if (queryBuilderState) {
            queryBuilderState.applicationStore.notificationService.notifyError(e.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [currentFunctionId, applicationStore, entities, queryBuilderState]);

  return (
    <>
      <CubesLoadingIndicator isLoading={isLoading}>
        <CubesLoadingIndicatorIcon />
      </CubesLoadingIndicator>
      {queryBuilderState && !isLoading && (
        <QueryBuilder queryBuilderState={queryBuilderState} />
      )}
      {!queryBuilderState && !isLoading && error && (
        <>Failed setting up QueryBuilderState&nbsp;{error}</>
      )}
    </>
  );
};
