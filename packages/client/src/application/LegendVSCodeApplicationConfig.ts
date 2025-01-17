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
  type LegendApplicationConfigurationInput,
  type PlainObject,
  LegendApplicationConfig,
  QueryBuilderConfig,
} from '@finos/legend-vscode-extension-dependencies';

export interface LegendVSCodeApplicationConfigurationData {
  appName: string;
  env: string;
  extensions?: ExtensionsConfigurationData;
}

export class LegendVSCodeApplicationConfig extends LegendApplicationConfig {
  /**
   * Config specific to query builder
   */
  queryBuilderConfig: QueryBuilderConfig | undefined;

  constructor(
    input: LegendApplicationConfigurationInput<LegendVSCodeApplicationConfigurationData>,
  ) {
    super(input);

    // options
    this.queryBuilderConfig = QueryBuilderConfig.serialization.fromJson(
      (input.configData.extensions?.core
        ?.queryBuilderConfig as PlainObject<QueryBuilderConfig>) ?? {},
    );
  }

  override getDefaultApplicationStorageKey(): string {
    return 'legend-vs-code';
  }
}
