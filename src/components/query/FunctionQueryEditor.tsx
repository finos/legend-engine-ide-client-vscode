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
  type QueryBuilderState,
  assertTrue,
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  Entity,
  FunctionQueryBuilderState,
  QueryBuilder,
  RawLambda,
  useApplicationStore,
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
  }, [functionId]);

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
    if (entities.length && functionId && applicationStore) {
      const initializeQuery = async (): Promise<void> => {
        try {
          const graphManagerState = await buildGraphManagerStateFromEntities(
            entities,
            applicationStore,
          );
          const functionElement =
            graphManagerState.graph.getFunction(functionId);
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
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          }
        } finally {
          setIsLoading(false);
        }
      };
      initializeQuery();
    } else {
      setIsLoading(false);
    }
  }, [functionId, applicationStore, entities]);

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
