import {
  type LegendApplicationConfigurationInput,
  ApplicationFrameworkProvider,
  ApplicationStore,
  ApplicationStoreProvider,
  assertErrorThrown,
  BrowserEnvironmentProvider,
  Core_GraphManagerPreset,
  Core_LegendApplicationPlugin,
  QueryBuilder_GraphManagerPreset,
  QueryBuilder_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';
import { useMemo } from 'react';
import {
  LegendVSCodeApplicationConfig,
  type LegendVSCodeApplicationConfigurationData,
} from './LegendVSCodeApplicationConfig';
import { LegendVSCodePluginManager } from './LegendVSCodePluginManager';
import { Core_LegendVSCodeApplicationPlugin } from './Core_LegendVSCodeApplicationPlugin';
import { postMessage } from '../utils/VsCodeUtils';
import { QUERY_BUILDER_CONFIG_ERROR } from '../utils/Const';

export const LegendVSCodeApplication = (props: {
  configData: LegendVSCodeApplicationConfigurationData;
  children: React.ReactNode;
}): React.ReactNode => {
  const { configData, children } = props;

  const applicationStore = useMemo(() => {
    const input: LegendApplicationConfigurationInput<LegendVSCodeApplicationConfigurationData> =
      {
        baseAddress: '',
        configData,
        versionData: {
          buildTime: '',
          version: '',
          commitSHA: '',
        },
      };
    try {
      const config: LegendVSCodeApplicationConfig =
        new LegendVSCodeApplicationConfig(input);
      const pluginManager: LegendVSCodePluginManager =
        LegendVSCodePluginManager.create();
      pluginManager
        .usePresets([
          new Core_GraphManagerPreset(),
          new QueryBuilder_GraphManagerPreset(),
        ])
        .usePlugins([
          new Core_LegendApplicationPlugin(),
          new QueryBuilder_LegendApplicationPlugin(),
          new Core_LegendVSCodeApplicationPlugin(),
        ])
        .install();
      return new ApplicationStore(config, pluginManager);
    } catch (e) {
      assertErrorThrown(e);
      postMessage({ command: QUERY_BUILDER_CONFIG_ERROR, msg: e.message });
      return null;
    }
  }, [configData]);

  return (
    applicationStore && (
      <ApplicationStoreProvider store={applicationStore}>
        <BrowserEnvironmentProvider baseUrl="/">
          <ApplicationFrameworkProvider simple={true}>
            {children}
          </ApplicationFrameworkProvider>
        </BrowserEnvironmentProvider>
      </ApplicationStoreProvider>
    )
  );
};
