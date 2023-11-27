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
  type ModelSchema,
  type PropSchema,
  custom,
  SKIP,
  deserialize,
  serialize,
} from 'serializr';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PlainObject<T = unknown> = Record<PropertyKey, unknown>;

export class SerializationFactory<T> {
  readonly schema: ModelSchema<T>;

  constructor(schema: ModelSchema<T>) {
    this.schema = schema;
  }

  toJson(val: T): PlainObject<T> {
    return serialize(this.schema, val);
  }

  fromJson(val: PlainObject<T>): T {
    return deserialize(this.schema, val);
  }
}

export const usingModelSchema = <T>(schema: ModelSchema<T>): PropSchema =>
  custom(
    (value) => (value === undefined ? SKIP : serialize(schema, value)),
    (value) => deserialize(schema, value),
  );
