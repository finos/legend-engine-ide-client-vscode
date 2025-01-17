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

import { LEGEND_APPLICATION_COLOR_THEME } from '@finos/legend-vscode-extension-dependencies';

export const vsCodeThemeKindToLegendColorTheme = (
  vsCodeThemeKind: number | undefined,
): LEGEND_APPLICATION_COLOR_THEME => {
  /**
   * VS Code theme kinds:
   * 1 - Light
   * 2 - Dark
   * 3 - HighContrast
   * 4 - HighContrastLight
   */
  if (vsCodeThemeKind === 1 || vsCodeThemeKind === 4) {
    return LEGEND_APPLICATION_COLOR_THEME.LEGACY_LIGHT;
  }
  return LEGEND_APPLICATION_COLOR_THEME.DEFAULT_DARK;
};
