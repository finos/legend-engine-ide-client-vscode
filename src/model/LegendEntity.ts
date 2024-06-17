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

import { createModelSchema, primitive, raw } from 'serializr';
import {
  usingModelSchema,
  SerializationFactory,
  type PlainObject,
} from '../utils/SerializationUtils';
import { TextLocation } from './TextLocation';

export class LegendEntity {
  path!: string;
  classifierPath!: string;
  content!: PlainObject<string>;
  location!: TextLocation;

  static readonly serialization = new SerializationFactory(
    createModelSchema(LegendEntity, {
      path: primitive(),
      classifierPath: primitive(),
      content: raw(),
      location: usingModelSchema(TextLocation.serialization.schema),
    }),
  );
}
