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
  type ExtensionsConfigurationData,
  type PlainObject,
  Core_GraphManagerPreset,
  guaranteeNonNullable,
  QueryBuilder_GraphManagerPreset,
  QueryBuilder_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type LegendApplicationConfigurationInput,
  type ApplicationStore,
  ApplicationStoreProvider,
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
import {
  getApplicationRootElement,
  LegendVSCodeWebviewApplication,
} from './LegendVSCodeWebviewApplication';
import packageJson from '../../package.json';

export class LegendVSCode extends LegendApplication {
  declare config: LegendVSCodeApplicationConfig;
  declare pluginManager: LegendVSCodePluginManager;
  engineUrl: string | undefined;
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

  override async fetchApplicationConfiguration(): Promise<
    [LegendApplicationConfig, ExtensionsConfigurationData]
  > {
    return [
      await this.configureApplication({
        configData: {
          appName: 'legend-vs-code',
          env: 'dev',
          engineURL: guaranteeNonNullable(this.engineUrl),
          documentation: {
            url: 'https://legend.finos.org',
            registry: [
              {
                url: 'https://legend.finos.org/resource/studio/documentation/shared.json',
                simple: true,
              },
              {
                url: 'https://legend.finos.org/resource/studio/documentation/query.json',
                simple: true,
              },
              {
                url: 'https://legend.finos.org/resource/studio/documentation/studio.json',
                simple: true,
              },
            ],
          },
        },
        versionData: {
          version: packageJson.version,
        },
        baseAddress: this.baseAddress,
      }),
      {},
    ];
  }

  withEngineUrl(engineUrl: string): LegendVSCode {
    this.engineUrl = engineUrl;
    return this;
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
        <LegendVSCodeWebviewApplication
          baseUrl={this.baseAddress}
          componentRouterProps={this.componentRouterProps}
        />
      </ApplicationStoreProvider>,
    );
  }
}
