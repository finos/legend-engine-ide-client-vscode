/**
 * Copyright (c) 2024-present, Goldman Sachs
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
  type SettingConfigurationEntry,
  collectSettingConfigurationEntriesFromConfig,
  LEGEND_APPLICATION_COLOR_THEME,
  LEGEND_APPLICATION_SETTING_KEY,
  Core_LegendApplicationPlugin,
} from '@finos/legend-vscode-extension-dependencies';

export class Core_LegendVSCodeApplicationPlugin extends Core_LegendApplicationPlugin {
  colorTheme: LEGEND_APPLICATION_COLOR_THEME;

  constructor(colorTheme?: LEGEND_APPLICATION_COLOR_THEME) {
    super();

    this.colorTheme = colorTheme ?? LEGEND_APPLICATION_COLOR_THEME.DEFAULT_DARK;
  }

  override getExtraSettingConfigurationEntries(): SettingConfigurationEntry[] {
    return collectSettingConfigurationEntriesFromConfig({
      [LEGEND_APPLICATION_SETTING_KEY.COLOR_THEME]: {
        defaultValue: this.colorTheme,
      },
    });
  }
}
