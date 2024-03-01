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

import { type LegendExecutionResult } from './LegendExecutionResult';
import {
  SerializationFactory,
} from '../utils/SerializationUtils';
import { createModelSchema, custom, list, primitive } from 'serializr';
import {
  deserializeLegendExecutionResult,
  serializeLegendExecutionResult,
} from './LegendExecutionResultSerializationHelper';

export class LanguageClientProgressResult {
  token?: string | number;
  value: LegendExecutionResult[] = [];

  static readonly serialization = new SerializationFactory(
    createModelSchema(LanguageClientProgressResult, {
      token: primitive(),
      value: list(
        custom(
          (value) => serializeLegendExecutionResult(value),
          (value) => deserializeLegendExecutionResult(value),
        ),
      ),
    }),
  );
}
