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
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  GraphManagerState,
  QueryBuilder,
  QueryBuilderActionConfig,
  ServiceQueryBuilderState,
  useApplicationStore,
} from '@finos/legend-vscode-extension-dependencies';
import {
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
  LEGEND_REFRESH_QUERY_BUILDER,
} from '../../utils/Const';
import { type LegendEntity } from '../../model/LegendEntity';
import { postMessage } from '../../utils/VsCodeUtils';
import { QueryBuilderVSCodeWorkflowState } from './QueryBuilderWorkflowState';
import { type LegendVSCodeApplicationConfig } from '../../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';

export const ServiceQueryEditor: React.FC<{
  serviceId: string;
}> = ({ serviceId }) => {
  const applicationStore = useApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >();
  const [queryBuilderState, setQueryBuilderState] =
    useState<QueryBuilderState | null>(null);
  const [entities, setEntities] = useState<LegendEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    postMessage({
      command: GET_PROJECT_ENTITIES,
    });
  }, [serviceId]);

  window.addEventListener(
    'message',
    (event: MessageEvent<{ result: LegendEntity[]; command: string }>) => {
      const message = event.data;
      switch (message.command) {
        case GET_PROJECT_ENTITIES_RESPONSE: {
          const es: LegendEntity[] = message.result;
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
          throw new Error(`Unsupported request ${message.command}`);
      }
    },
  );

  useEffect(() => {
    if (entities.length && serviceId && applicationStore) {
      const initializeQuery = async (): Promise<void> => {
        try {
          const graphManagerState = new GraphManagerState(
            applicationStore.pluginManager,
            applicationStore.logService,
          );
          await graphManagerState.graphManager.initialize({
            env: 'test',
            tabSize: 2,
            clientConfig: {
              baseUrl: applicationStore.config.engineServerUrl,
              enableCompression: false,
            },
          });
          await graphManagerState.initializeSystem();
          await graphManagerState.graphManager.buildGraph(
            graphManagerState.graph,
            entities,
            graphManagerState.graphBuildState,
            {},
          );
          const service = graphManagerState.graph.getService(serviceId);
          const newQueryBuilderState = new ServiceQueryBuilderState(
            applicationStore,
            graphManagerState,
            QueryBuilderVSCodeWorkflowState.INSTANCE,
            QueryBuilderActionConfig.INSTANCE,
            service,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              service: service.path,
            },
          );
          newQueryBuilderState.initializeWithQuery(service.execution.func);
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
  }, [serviceId, applicationStore, entities]);

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
