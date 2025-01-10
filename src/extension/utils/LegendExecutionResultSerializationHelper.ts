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

import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import { FunctionLegendExecutionResult } from '../model/FunctionLegendExecutionResult';
import { LegendExecutionResult } from '../../shared/model/LegendExecutionResult';

export const serializeLegendExecutionResult = (
  model: LegendExecutionResult,
): PlainObject<LegendExecutionResult> => {
  if (model instanceof FunctionLegendExecutionResult) {
    return FunctionLegendExecutionResult.serialization.toJson(model);
  }
  return LegendExecutionResult.serialization.toJson(model);
};

export const deserializeLegendExecutionResult = (
  json: PlainObject<LegendExecutionResult>,
): LegendExecutionResult => {
  if (json.uri) {
    return FunctionLegendExecutionResult.serialization.fromJson(json);
  }
  return LegendExecutionResult.serialization.fromJson(json);
};
