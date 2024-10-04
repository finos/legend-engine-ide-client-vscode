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

import {
  type PlainObject,
  type AbstractPlugin,
  type AbstractPreset,
  assertErrorThrown,
  guaranteeNonNullable,
} from '@finos/legend-vscode-extension-dependencies';
import { LegendVSCode } from './LegendVSCode';
import { QUERY_BUILDER_CONFIG_ERROR } from '../utils/Const';
import { type LegendVSCodeApplicationConfigurationData } from './LegendVSCodeApplicationConfig';
import { type LegendApplicationVersionData } from '@finos/legend-application';
import packageJson from '../../package.json';

export class LegendVSCodeWebviewApplication {
  static getConfigData(engineUrl: string): {
    configData: LegendVSCodeApplicationConfigurationData;
    versionData: LegendApplicationVersionData;
  } {
    return {
      configData: {
        appName: 'legend-vs-code',
        env: 'dev',
        engineURL: guaranteeNonNullable(engineUrl),
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
    };
  }

  static getPresetCollection(): AbstractPreset[] {
    return [];
  }

  static getPluginCollection(): AbstractPlugin[] {
    return [];
  }

  static run(
    baseUrl: string,
    engineUrl: string,
    componentRouterProps: PlainObject,
  ): void {
    LegendVSCode.create()
      .withComponentRouterProps(componentRouterProps)
      .setup({ baseAddress: baseUrl })
      .withPresets(LegendVSCodeWebviewApplication.getPresetCollection())
      .withPlugins(LegendVSCodeWebviewApplication.getPluginCollection())
      .start(this.getConfigData(engineUrl))
      .catch((e: unknown) => {
        assertErrorThrown(e);
        postMessage({ command: QUERY_BUILDER_CONFIG_ERROR, msg: e.message });
      });
  }
}

export const LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID = 'root';

export const getApplicationRootElement = (): Element => {
  const rootEl = document.getElementById(
    LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID,
  );
  if (!rootEl) {
    throw new Error(
      `Can't find root element with tag '${LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID}'`,
    );
  }
  return rootEl;
};
