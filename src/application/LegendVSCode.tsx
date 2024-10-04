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
  Core_GraphManagerPreset,
  type PlainObject,
  QueryBuilder_GraphManagerPreset,
  QueryBuilder_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type LegendApplicationConfigurationInput,
  ApplicationFrameworkProvider,
  type ApplicationStore,
  ApplicationStoreProvider,
  BrowserEnvironmentProvider,
  Core_LegendApplicationPlugin,
  LegendApplication,
  type LegendApplicationConfig,
} from '@finos/legend-application';
import {
  LegendVSCodeApplicationConfig,
  type LegendVSCodeApplicationConfigurationData,
} from './LegendVSCodeApplicationConfig';
import { LegendVSCodePluginManager } from './LegendVSCodePluginManager';
import { Core_LegendVSCodeApplicationPlugin } from './Core_LegendVSCodeApplicationPlugin';
import { createRoot } from 'react-dom/client';
import { ComponentRouter } from '../components/ComponentRouter';
import { getApplicationRootElement } from './LegendVSCodeWebviewApplication';

export class LegendVSCode extends LegendApplication {
  declare config: LegendVSCodeApplicationConfig;
  declare pluginManager: LegendVSCodePluginManager;
  componentRouterProps: PlainObject | undefined;

  static create(): LegendVSCode {
    const application = new LegendVSCode(LegendVSCodePluginManager.create());
    application.withBasePresets([
      new Core_GraphManagerPreset(),
      new QueryBuilder_GraphManagerPreset(),
    ]);
    application.withBasePlugins([
      new QueryBuilder_LegendApplicationPlugin(),
      new Core_LegendApplicationPlugin(),
      new Core_LegendVSCodeApplicationPlugin(),
    ]);
    return application;
  }

  async configureApplication(
    input: LegendApplicationConfigurationInput<LegendVSCodeApplicationConfigurationData>,
  ): Promise<LegendApplicationConfig> {
    return new LegendVSCodeApplicationConfig(input);
  }

  withComponentRouterProps(props: PlainObject): LegendVSCode {
    this.componentRouterProps = props;
    return this;
  }

  async loadApplication(
    applicationStore: ApplicationStore<
      LegendVSCodeApplicationConfig,
      LegendVSCodePluginManager
    >,
  ): Promise<void> {
    createRoot(getApplicationRootElement()).render(
      <ApplicationStoreProvider store={applicationStore}>
        <BrowserEnvironmentProvider baseUrl={this.baseAddress}>
          <ApplicationFrameworkProvider>
            <ComponentRouter {...this.componentRouterProps} />
          </ApplicationFrameworkProvider>
        </BrowserEnvironmentProvider>
      </ApplicationStoreProvider>,
    );
  }
}
