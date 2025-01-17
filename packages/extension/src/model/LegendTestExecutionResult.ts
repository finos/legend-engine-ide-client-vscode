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

import { createModelSchema, list, optional, primitive } from 'serializr';
import {
  type LegendExecutionResultType,
  SerializationFactory,
  usingModelSchema,
} from '@finos/legend-engine-ide-client-vscode-shared';
import { LegendTestAssertionResult } from './LegendTestAssertionResult';

export class LegendTestExecutionResult {
  id!: string;
  type!: LegendExecutionResultType;
  message?: string;
  output?: string;
  assertionResults?: LegendTestAssertionResult[];

  static readonly serialization = new SerializationFactory(
    createModelSchema(LegendTestExecutionResult, {
      id: primitive(),
      type: primitive(),
      message: optional(primitive()),
      output: optional(primitive()),
      assertionResults: optional(
        list(usingModelSchema(LegendTestAssertionResult.serialization.schema)),
      ),
    }),
  );
}
