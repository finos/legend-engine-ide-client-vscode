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

import { useEffect, useMemo, useState } from 'react';
import {
  type AbstractPreset,
  ApplicationStore,
  getPureGraph,
  type LegendApplicationConfigurationData,
  type LegendApplicationConfigurationInput,
  type QueryBuilderState,
  GraphManagerState,
  ServiceQueryBuilderState,
  type Service,
  QueryBuilderActionConfig,
  QueryBuilder,
  LegendVSCodeApplicationConfig,
  LegendVSCodePluginManager,
  QueryBuilderVSCodeWorkflowState,
  ApplicationStoreProvider,
  ApplicationFrameworkProvider,
  BrowserEnvironmentProvider,
} from '@finos/legend-vscode-extension-dependencies';
import {
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
} from '../../utils/Const';
import { type LegendEntity } from '../../model/LegendEntity';
import { postMessage } from '../../utils/VsCodeUtils';

export const ServiceQueryEditor: React.FC<{
  serviceId: string;
  presets: AbstractPreset[];
}> = ({ serviceId, presets }) => {
  const [queryBuilderState, setQueryBuilderState] =
    useState<QueryBuilderState | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [entities, setEntities] = useState<LegendEntity[]>([]);
  const [error, setError] = useState<string | null>();

  const applicationStore = useMemo(() => {
    const input: LegendApplicationConfigurationInput<LegendApplicationConfigurationData> =
      {
        baseAddress: 'http://localhost:9000',
        configData: {
          appName: 'legend-vs-code',
          env: 'dev',
        },
        versionData: {
          buildTime: 'now',
          version: '0.0.0',
          commitSHA: 'commitSHA',
        },
      };
    const config: LegendVSCodeApplicationConfig =
      new LegendVSCodeApplicationConfig(input);
    const pluginManager: LegendVSCodePluginManager =
      LegendVSCodePluginManager.create();
    return new ApplicationStore(config, pluginManager);
  }, []);

  console.log('serviceId:', serviceId);

  useEffect(() => {
    console.log('sending message to get project entities');
    postMessage({
      command: GET_PROJECT_ENTITIES,
    });
  }, [serviceId]);

  window.addEventListener(
    'message',
    (event: MessageEvent<{ result: LegendEntity[]; command: string }>) => {
      const message = event.data;
      console.log('got message:', message);
      if (message.command === GET_PROJECT_ENTITIES_RESPONSE) {
        const es: LegendEntity[] = message.result;
        setEntities(es);
      }
    },
  );

  useEffect(() => {
    if (entities.length && serviceId) {
      getPureGraph(entities, presets)
        .then((pureModel) => {
          console.log('made pure model:', pureModel);
          console.log('service:', pureModel.getService(serviceId));
          setService(pureModel.getService(serviceId));
          setError(null);
        })
        .catch((e) => {
          setError(e.message);
          setService(null);
        });
    }
  }, [entities, serviceId, presets]);

  useEffect(() => {
    console.log('service in useEffect:', service);
    if (service && applicationStore) {
      setQueryBuilderState(
        new ServiceQueryBuilderState(
          applicationStore,
          new GraphManagerState(
            applicationStore.pluginManager,
            applicationStore.logService,
          ),
          QueryBuilderVSCodeWorkflowState.INSTANCE,
          QueryBuilderActionConfig.INSTANCE,
          service,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ),
      );
    }
  }, [service, applicationStore]);

  return (
    <ApplicationStoreProvider store={applicationStore}>
      <BrowserEnvironmentProvider baseUrl="/">
        <ApplicationFrameworkProvider simple={true}>
          {queryBuilderState && (
            <QueryBuilder queryBuilderState={queryBuilderState} />
          )}
          {!queryBuilderState && <>Failed setting up QueryBuilderState</>}
          {error ? (
            <div className="service__query__editor__error">
              <span>Something went wrong. Diagram cannot be created.</span>
              <span
                className="service__query__editor_error__details"
                title={`${error}`}
              >
                Error Details.
              </span>
            </div>
          ) : null}
        </ApplicationFrameworkProvider>
      </BrowserEnvironmentProvider>
    </ApplicationStoreProvider>
  );
};
