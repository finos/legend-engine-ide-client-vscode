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
