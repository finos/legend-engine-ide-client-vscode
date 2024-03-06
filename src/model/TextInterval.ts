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

import { Range, Position } from 'vscode';
import { createModelSchema } from 'serializr';
import {
  usingModelSchema,
  SerializationFactory,
} from '../utils/SerializationUtils';
import { TextPosition } from './TextPosition';

export class TextInterval {
  start!: TextPosition;
  end!: TextPosition;

  toRange(): Range {
    return new Range(
      new Position(this.start.line, this.start.column),
      new Position(this.end.line, this.end.column + 1),
    );
  }

  static readonly serialization = new SerializationFactory(
    createModelSchema(TextInterval, {
      start: usingModelSchema(TextPosition.serialization.schema),
      end: usingModelSchema(TextPosition.serialization.schema),
    }),
  );
}
