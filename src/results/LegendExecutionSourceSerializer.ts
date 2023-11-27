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

import type { PlainObject } from '../utils/SerializationUtils';
import { LegendExecutionLegacyTestSource } from './LegendExecutionLegacyTestSource';
import { LegendExecutionSource } from './LegendExecutionResultSource';
import { LegendExecutionTestableSource } from './LegendExecutionTestableSource';

export const deserializeLegendLanguageSource = (
  json: PlainObject<LegendExecutionSource>,
): LegendExecutionSource => {
  if (json._type === 'legendExecutionLegacyTestSource') {
    return LegendExecutionLegacyTestSource.serialization.fromJson(json);
  } else if (json._type === 'legendExecutionTestableSource') {
    return LegendExecutionTestableSource.serialization.fromJson(json);
  }
  return LegendExecutionSource.serialization.fromJson(json);
};

export const serializeegendLanguageSource = (
  model: LegendExecutionSource,
): PlainObject<LegendExecutionSource> => {
  if (model instanceof LegendExecutionLegacyTestSource) {
    return LegendExecutionLegacyTestSource.serialization.toJson(model);
  } else if (model instanceof LegendExecutionTestableSource) {
    return LegendExecutionTestableSource.serialization.toJson(model);
  }
  return LegendExecutionSource.serialization.toJson(model);
};
