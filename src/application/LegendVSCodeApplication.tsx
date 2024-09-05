import {
  type LegendApplicationConfigurationData,
  type LegendApplicationConfigurationInput,
  ApplicationFrameworkProvider,
  ApplicationStore,
  ApplicationStoreProvider,
  BrowserEnvironmentProvider,
  Core_GraphManagerPreset,
  Core_LegendApplicationPlugin,
  QueryBuilder_GraphManagerPreset,
  QueryBuilder_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';
import { useMemo } from 'react';
import { LegendVSCodeApplicationConfig } from './LegendVSCodeApplicationConfig';
import { LegendVSCodePluginManager } from './LegendVSCodePluginManager';
import { Core_LegendVSCodeApplicationPlugin } from './Core_LegendVSCodeApplicationPlugin';

export const LegendVSCodeApplication = (props: {
  children: React.ReactNode;
}): React.ReactNode => {
  const { children } = props;

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
  }, []);

  return (
    <ApplicationStoreProvider store={applicationStore}>
      <BrowserEnvironmentProvider baseUrl="/">
        <ApplicationFrameworkProvider simple={true}>
          {children}
        </ApplicationFrameworkProvider>
      </BrowserEnvironmentProvider>
    </ApplicationStoreProvider>
  );
};
