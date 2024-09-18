/**
 * Copyright (c) 2023-present, Goldman Sachs
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

import {
  type ApplicationStore,
  GraphManagerState,
} from '@finos/legend-vscode-extension-dependencies';
import { type LegendEntity } from '../model/LegendEntity';
import { type LegendVSCodeApplicationConfig } from '../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../application/LegendVSCodePluginManager';

export const buildGraphManagerStateFromEntities = async (
  entities: LegendEntity[],
  applicationStore: ApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >,
): GraphManagerState => {
  const graphManagerState = new GraphManagerState(
    applicationStore.pluginManager,
    applicationStore.logService,
  );
  await graphManagerState.graphManager.initialize({
    env: 'dev',
    tabSize: 2,
    clientConfig: {
      baseUrl: applicationStore.config.engineServerUrl,
      enableCompression: true,
    },
  });
  await graphManagerState.initializeSystem();
  await graphManagerState.graphManager.buildGraph(
    graphManagerState.graph,
    entities,
    graphManagerState.graphBuildState,
    {},
  );
  return graphManagerState;
};
