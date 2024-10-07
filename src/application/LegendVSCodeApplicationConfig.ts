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
  type LegendApplicationConfigurationData,
  type LegendApplicationConfigurationInput,
  type QueryBuilderConfig,
  guaranteeNonEmptyString,
  LegendApplicationConfig,
} from '@finos/legend-vscode-extension-dependencies';

export interface LegendVSCodeApplicationConfigurationData
  extends LegendApplicationConfigurationData {
  engineURL: string;
  queryBuilderConfig?: QueryBuilderConfig;
}

export class LegendVSCodeApplicationConfig extends LegendApplicationConfig {
  readonly engineServerUrl: string;
  /**
   * Config specific to query builder
   */
  readonly queryBuilderConfig: QueryBuilderConfig | undefined;

  constructor(
    input: LegendApplicationConfigurationInput<LegendVSCodeApplicationConfigurationData>,
  ) {
    super(input);

    // engine
    this.engineServerUrl = LegendApplicationConfig.resolveAbsoluteUrl(
      guaranteeNonEmptyString(
        input.configData.engineURL,
        `Can't configure application: Engine server URL is missing in extension settings`,
      ),
    );

    this.queryBuilderConfig = input.configData.queryBuilderConfig;
  }

  override getDefaultApplicationStorageKey(): string {
    return 'legend-vs-code';
  }
}
