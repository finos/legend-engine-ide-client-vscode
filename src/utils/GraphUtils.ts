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
  guaranteeType,
  type ApplicationStore,
} from '@finos/legend-vscode-extension-dependencies';
import { type LegendEntity } from '../model/LegendEntity';
import { type LegendVSCodeApplicationConfig } from '../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../application/LegendVSCodePluginManager';
import { type V1_LSPEngine } from '../graph/V1_LSPEngine';
import {
  buildPureGraphManager,
  GraphManagerState,
  V1_PureGraphManager,
} from '@finos/legend-graph';

export const buildGraphManagerStateFromEntities = async (
  entities: LegendEntity[],
  applicationStore: ApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >,
  engine: V1_LSPEngine,
): Promise<GraphManagerState> => {
  const newGraphManager = buildPureGraphManager(
    applicationStore.pluginManager,
    applicationStore.logService,
    engine,
  );
  const graphManagerState = new GraphManagerState(
    applicationStore.pluginManager,
    applicationStore.logService,
    newGraphManager,
  );
  const graphManager = guaranteeType(
    graphManagerState.graphManager,
    V1_PureGraphManager,
  );
  await graphManager.initialize(
    {
      env: 'dev',
      tabSize: 2,
      clientConfig: {
        baseUrl: applicationStore.config.engineServerUrl,
        enableCompression: true,
      },
    },
    {
      engine,
    },
  );
  await graphManagerState.initializeSystem();
  await graphManagerState.graphManager.buildGraph(
    graphManagerState.graph,
    entities,
    graphManagerState.graphBuildState,
    {},
  );
  return graphManagerState;
};
