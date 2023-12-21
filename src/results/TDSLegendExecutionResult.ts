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

import { createModelSchema, list, primitive } from 'serializr';
import {
  SerializationFactory,
  usingModelSchema,
} from '../utils/SerializationUtils';

export class TDSRow {
  values: (string | number | boolean | null)[] = [];

  static readonly serialization = new SerializationFactory(
    createModelSchema(TDSRow, {
      values: list(primitive()),
    }),
  );
}

export class TabularDataSet {
  columns: string[] = [];
  rows: TDSRow[] = [];

  static readonly serialization = new SerializationFactory(
    createModelSchema(TabularDataSet, {
      columns: list(primitive()),
      rows: list(usingModelSchema(TDSRow.serialization.schema)),
    }),
  );
}

export class TDSLegendExecutionResult {
  result!: TabularDataSet;

  static readonly serialization = new SerializationFactory(
    createModelSchema(TDSLegendExecutionResult, {
      result: usingModelSchema(TabularDataSet.serialization.schema),
    }),
  );
}
