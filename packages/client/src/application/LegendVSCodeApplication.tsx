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
  type AbstractPlugin,
  type AbstractPreset,
  type LegendApplicationConfigurationData,
  type LegendApplicationConfigurationInput,
  ApplicationFrameworkProvider,
  ApplicationStore,
  ApplicationStoreProvider,
  assertErrorThrown,
  BrowserEnvironmentProvider,
  Core_GraphManagerPreset,
  Core_LegendApplicationPlugin,
  DSL_Diagram_GraphManagerPreset,
  QueryBuilder_GraphManagerPreset,
  QueryBuilder_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';
import { useMemo } from 'react';
import { LegendVSCodeApplicationConfig } from './LegendVSCodeApplicationConfig';
import { LegendVSCodePluginManager } from './LegendVSCodePluginManager';
import { Core_LegendVSCodeApplicationPlugin } from './Core_LegendVSCodeApplicationPlugin';
import { postMessage } from '../utils/VsCodeUtils';
import { QUERY_BUILDER_CONFIG_ERROR } from '@finos/legend-engine-ide-client-vscode-shared';
import packageJson from '../../package.json';

export const LegendVSCodeApplication = (props: {
  configData: LegendApplicationConfigurationData;
  presets?: AbstractPreset[] | undefined;
  plugins?: AbstractPlugin[] | undefined;
  children: React.ReactNode;
}): React.ReactNode => {
  const { configData, presets, plugins, children } = props;

  const applicationStore = useMemo(() => {
    const input: LegendApplicationConfigurationInput<LegendApplicationConfigurationData> =
      {
        configData,
        versionData: {
          version: packageJson.version,
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
          new DSL_Diagram_GraphManagerPreset(),
          ...(presets ?? []),
        ])
        .usePlugins([
          new Core_LegendApplicationPlugin(),
          new QueryBuilder_LegendApplicationPlugin(),
          new Core_LegendVSCodeApplicationPlugin(),
          ...(plugins ?? []),
        ])
        .install();
      return new ApplicationStore(config, pluginManager);
    } catch (e) {
      assertErrorThrown(e);
      postMessage({ command: QUERY_BUILDER_CONFIG_ERROR, msg: e.message });
      return null;
    }
  }, [configData, presets, plugins]);

  return (
    applicationStore && (
      <ApplicationStoreProvider store={applicationStore}>
        <BrowserEnvironmentProvider baseUrl="/">
          <ApplicationFrameworkProvider>
            {children}
          </ApplicationFrameworkProvider>
        </BrowserEnvironmentProvider>
      </ApplicationStoreProvider>
    )
  );
};
