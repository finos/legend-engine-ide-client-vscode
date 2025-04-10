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
  type V1_PackageableElement,
  assertTrue,
  FunctionQueryBuilderState,
  GenericTypeExplicitReference,
  graph_renameElement,
  guaranteeNonNullable,
  guaranteeType,
  pureExecution_setFunction,
  PureExecution,
  QueryBuilderActionConfig,
  RawLambda,
  ServiceQueryBuilderState,
  useApplicationStore,
  V1_buildVariable,
  V1_ConcreteFunctionDefinition,
  V1_deserializePackageableElement,
  V1_GraphBuilderContextBuilder,
  V1_PureExecution,
  V1_PureGraphManager,
  V1_serviceModelSchema,
} from '@finos/legend-vscode-extension-dependencies';
import {
  CLASSIFIER_PATH,
  LEGEND_REFRESH_QUERY_BUILDER,
  LEGEND_UPDATE_COLOR_THEME_KIND_COMMAND_ID,
} from '@finos/legend-engine-ide-client-vscode-shared';
import { QueryBuilderVSCodeWorkflowState } from './QueryBuilderWorkflowState';
import { type LegendVSCodeApplicationConfig } from '../../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';
import {
  buildGraphManagerStateFromEntities,
  buildRawLambdaFromFunction,
} from '../../utils/GraphUtils';
import { V1_LSPEngine } from '../../graph/V1_LSPEngine';
import { deserialize } from 'serializr';
import { getMinimalEntities } from './QueryBuilderStateUtils';
import { vsCodeThemeKindToLegendColorTheme } from '../../utils/ThemeUtils';

export const useQueryBuilderState = (
  initialId: string,
  classifierPath: CLASSIFIER_PATH,
): {
  queryBuilderState: QueryBuilderState | null;
  isLoading: boolean;
  error: string;
} => {
  const applicationStore = useApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >();
  // Because the entity ID can change without re-creating the entire webview (i.e., when saving a text document),
  // we need to keep track of the previous and current entity IDs so we can track which to use to fetch the
  // correct graph entity.
  const [previousId, setPreviousId] = useState(initialId);
  const [currentId, setCurrentId] = useState(initialId);
  const [queryBuilderState, setQueryBuilderState] =
    useState<QueryBuilderState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [dummyElements, setDummyElements] = useState<V1_PackageableElement[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndSetMinimalEntities = async (): Promise<void> => {
      try {
        const { entities: newEntities, dummyElements: newDummyElements } =
          await getMinimalEntities(initialId, applicationStore.pluginManager);
        setEntities(newEntities);
        setDummyElements(newDummyElements);
        setError('');
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    fetchAndSetMinimalEntities();
  }, [initialId, applicationStore.pluginManager]);

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<{
        command: string;
        result: Entity[];
        updatedEntityId?: string;
        colorThemeKind?: number;
      }>,
    ): Promise<void> => {
      const message = event.data;
      switch (message.command) {
        case LEGEND_REFRESH_QUERY_BUILDER: {
          try {
            setIsLoading(true);
            const { entities: newEntities, dummyElements: newDummyElements } =
              await getMinimalEntities(
                message.updatedEntityId ?? currentId,
                applicationStore.pluginManager,
              );
            if (message.updatedEntityId) {
              setPreviousId(currentId);
              setCurrentId(message.updatedEntityId);
            }
            setEntities(newEntities);
            setDummyElements(newDummyElements);
            setError('');
          } catch (e) {
            if (e instanceof Error) {
              setError(e.message);
            }
            setQueryBuilderState(null);
          } finally {
            setIsLoading(false);
          }
          break;
        }
        case LEGEND_UPDATE_COLOR_THEME_KIND_COMMAND_ID: {
          if (queryBuilderState && message.colorThemeKind) {
            queryBuilderState.applicationStore.layoutService.setColorTheme(
              vsCodeThemeKindToLegendColorTheme(message.colorThemeKind),
            );
          }
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
  }, [currentId, queryBuilderState, applicationStore.pluginManager]);

  useEffect(() => {
    const buildGraphManagerStateAndInitializeQuery =
      async (): Promise<void> => {
        const engine = new V1_LSPEngine();

        const graphManagerState = await buildGraphManagerStateFromEntities(
          entities,
          applicationStore,
          engine,
          dummyElements,
        );

        if (classifierPath === CLASSIFIER_PATH.SERVICE) {
          const serviceEntity = graphManagerState.graph.getService(currentId);
          const serviceExecution = guaranteeType(
            serviceEntity.execution,
            PureExecution,
          );
          const newQueryBuilderState = new ServiceQueryBuilderState(
            applicationStore,
            graphManagerState,
            QueryBuilderVSCodeWorkflowState.INSTANCE,
            QueryBuilderActionConfig.INSTANCE,
            serviceEntity,
            undefined,
            undefined,
            undefined,
            undefined,
            applicationStore.config.queryBuilderConfig,
            {
              service: serviceEntity.path,
            },
          );
          newQueryBuilderState.initializeWithQuery(serviceExecution.func);
          await flowResult(
            newQueryBuilderState.explorerState.analyzeMappingModelCoverage(),
          ).catch(applicationStore.alertUnhandledError);
          setQueryBuilderState(newQueryBuilderState);
        } else if (classifierPath === CLASSIFIER_PATH.FUNCTION) {
          const functionEntity = graphManagerState.graph.getFunction(currentId);
          const newQueryBuilderState = new FunctionQueryBuilderState(
            applicationStore,
            graphManagerState,
            QueryBuilderVSCodeWorkflowState.INSTANCE,
            functionEntity,
            undefined,
          );
          newQueryBuilderState.initializeWithQuery(
            buildRawLambdaFromFunction(functionEntity, graphManagerState),
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
        }
      };

    const updateExistingQuery = (): void => {
      const nonNullQueryBuilderState = guaranteeNonNullable(queryBuilderState);

      if (classifierPath === CLASSIFIER_PATH.SERVICE) {
        // Get updated service execution
        const V1_newExecution = guaranteeType(
          deserialize(
            V1_serviceModelSchema(
              applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
            ),
            guaranteeNonNullable(
              entities.find((entity) => entity.path === currentId)?.content,
            ),
          ).execution,
          V1_PureExecution,
        );

        // Create new lambda from updated execution
        const newFunc = new RawLambda(
          V1_newExecution.func.parameters,
          V1_newExecution.func.body,
        );

        // Get the existing service entity and execution
        const existingService = guaranteeNonNullable(
          nonNullQueryBuilderState.graphManagerState.graph.getService(
            currentId,
          ),
        );
        const existingExecution = guaranteeType(
          existingService.execution,
          PureExecution,
        );

        // Update the existing execution with the new lambda
        pureExecution_setFunction(existingExecution, newFunc);
        nonNullQueryBuilderState.initializeWithQuery(newFunc);
      } else if (classifierPath === CLASSIFIER_PATH.FUNCTION) {
        const graphManager = guaranteeType(
          nonNullQueryBuilderState.graphManagerState.graphManager,
          V1_PureGraphManager,
          'Graph manager must be a V1_PureGraphManager',
        );

        // Get updated function entity
        const V1_functionDefinition = guaranteeType(
          V1_deserializePackageableElement(
            guaranteeNonNullable(
              entities.find((entity) => entity.path === currentId)?.content,
              `Unable to find function entity with ID ${currentId}`,
            ),
            applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
          ),
          V1_ConcreteFunctionDefinition,
        );

        // Get existing function entity
        let existingFunctionEntity;
        try {
          // If the function was changed from the text document, then we need to get
          // the function using its previous ID, as we haven't updated the graph yet.
          existingFunctionEntity =
            nonNullQueryBuilderState.graphManagerState.graph.getFunction(
              previousId,
            );
        } catch {
          // If the function was updated in the query builder and then saved, the graph
          // has been updated, so we can get the function using its current ID.
          existingFunctionEntity =
            nonNullQueryBuilderState.graphManagerState.graph.getFunction(
              currentId,
            );
        }

        // Update existing function element
        const graphBuilderContext = new V1_GraphBuilderContextBuilder(
          nonNullQueryBuilderState.graphManagerState.graph,
          nonNullQueryBuilderState.graphManagerState.graph,
          graphManager.graphBuilderExtensions,
          applicationStore.logService,
        ).build();
        existingFunctionEntity.returnType = GenericTypeExplicitReference.create(
          graphBuilderContext.resolveGenericTypeFromProtocol(
            V1_functionDefinition.returnGenericType,
          ).value,
        );
        existingFunctionEntity.returnMultiplicity =
          V1_functionDefinition.returnMultiplicity;
        existingFunctionEntity.expressionSequence =
          V1_functionDefinition.body as object[];
        const context = new V1_GraphBuilderContextBuilder(
          nonNullQueryBuilderState.graphManagerState.graph,
          nonNullQueryBuilderState.graphManagerState.graph,
          graphManager.graphBuilderExtensions,
          graphManager.logService,
        ).build();
        existingFunctionEntity.parameters =
          V1_functionDefinition.parameters.map((e) =>
            V1_buildVariable(e, context),
          );

        // We need to update the function name if the signature has changed, and we
        // need to do it after we update the parameters so that we can set the new
        // functionName property
        if (existingFunctionEntity.path !== V1_functionDefinition.path) {
          graph_renameElement(
            nonNullQueryBuilderState.graphManagerState.graph,
            existingFunctionEntity,
            V1_functionDefinition.path,
            nonNullQueryBuilderState.observerContext,
          );
        }

        // Re-initialize query builder
        nonNullQueryBuilderState.initializeWithQuery(
          buildRawLambdaFromFunction(
            existingFunctionEntity,
            nonNullQueryBuilderState.graphManagerState,
          ),
        );
      }
    };

    if (entities.length && currentId && applicationStore && !error) {
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
            queryBuilderState.applicationStore.notificationService.notifyError(
              e.message,
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [
    applicationStore,
    classifierPath,
    currentId,
    dummyElements,
    entities,
    error,
    previousId,
    queryBuilderState,
  ]);

  return { queryBuilderState, isLoading, error };
};
