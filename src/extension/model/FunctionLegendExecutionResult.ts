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
  createModelSchema,
  custom,
  list,
  optional,
  primitive,
} from 'serializr';
import {
  deserializeMap,
  SerializationFactory,
  serializeMap,
} from '../../shared/utils/SerializationUtils';
import { LegendExecutionResult } from '../../shared/model/LegendExecutionResult';

export class FunctionLegendExecutionResult extends LegendExecutionResult {
  sectionNum!: number;
  uri!: string;
  inputParameters?: Map<string, object> | undefined;

  static override readonly serialization = new SerializationFactory(
    createModelSchema(FunctionLegendExecutionResult, {
      ids: list(primitive()),
      type: primitive(),
      message: primitive(),
      logMessage: optional(primitive()),
      sectionNum: primitive(),
      uri: primitive(),
      inputParameters: optional(
        custom(
          (value) => serializeMap(value, (val: unknown) => val),
          (value) => deserializeMap(value, (val: unknown) => val),
        ),
      ),
    }),
  );
}
