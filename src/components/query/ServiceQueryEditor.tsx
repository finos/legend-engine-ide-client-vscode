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
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  guaranteeNonNullable,
  guaranteeType,
  pureExecution_setFunction,
  PureExecution,
  QueryBuilder,
  QueryBuilderActionConfig,
  RawLambda,
  ServiceQueryBuilderState,
  useApplicationStore,
  V1_PureExecution,
  V1_serviceModelSchema,
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
import { V1_LSPEngine } from '../../graph/V1_LSPEngine';
import { deserialize } from 'serializr';

export const ServiceQueryEditor: React.FC<{
  serviceId: string;
}> = ({ serviceId }) => {
  const applicationStore = useApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >();
  const [initialized, setInitialized] = useState(false);
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
  }, [serviceId]);

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
        const engine = new V1_LSPEngine();
        const graphManagerState = await buildGraphManagerStateFromEntities(
          entities,
          applicationStore,
          engine,
        );
        const service = graphManagerState.graph.getService(serviceId);
        const serviceExecution = guaranteeType(
          service.execution,
          PureExecution,
        );
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
        newQueryBuilderState.initializeWithQuery(serviceExecution.func);
        await flowResult(
          newQueryBuilderState.explorerState.analyzeMappingModelCoverage(),
        ).catch(applicationStore.alertUnhandledError);
        setQueryBuilderState(newQueryBuilderState);
        setInitialized(true);
      };

    const updateExistingQuery = (): void => {
      const nonNullQueryBuilderState = guaranteeNonNullable(queryBuilderState);
      const V1_newExecution = guaranteeType<V1_PureExecution>(
        deserialize(
          V1_serviceModelSchema(
            applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
          ),
          guaranteeNonNullable(
            entities.find((entity) => entity.path === serviceId)?.content,
          ),
        ).execution,
        V1_PureExecution,
      );
      const newFunc = new RawLambda(
        V1_newExecution.func.parameters,
        V1_newExecution.func.body,
      );
      const existingService = guaranteeNonNullable(
        nonNullQueryBuilderState.graphManagerState.graph.getService(serviceId),
      );
      const existingExecution = guaranteeType(
        existingService.execution,
        PureExecution,
      );
      pureExecution_setFunction(existingExecution, newFunc);
      nonNullQueryBuilderState.initializeWithQuery(newFunc);
    };
    if (entities.length && serviceId && applicationStore) {
      try {
        if (!initialized) {
          buildGraphManagerStateAndInitializeQuery();
        } else {
          updateExistingQuery();
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [serviceId, applicationStore, entities, initialized]);

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
