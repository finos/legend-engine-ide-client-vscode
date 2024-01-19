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

import { createModelSchema, optional, primitive } from 'serializr';
import {
  SerializationFactory,
  usingModelSchema,
} from '../utils/SerializationUtils';

export class Multiplicity {
  readonly lowerBound: number;
  readonly upperBound?: number | undefined;

  constructor(lowerBound: number, upperBound: number | undefined) {
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
  }

  static readonly serialization = new SerializationFactory(
    createModelSchema(Multiplicity, {
      lowerBound: primitive(),
      upperBound: optional(primitive()),
    }),
  );

  // common multiplicities
  static readonly ZERO = new Multiplicity(0, 0);
  static readonly ZERO_ONE = new Multiplicity(0, 1);
  static readonly ZERO_MANY = new Multiplicity(0, undefined);
  static readonly ONE = new Multiplicity(1, 1);
  static readonly ONE_MANY = new Multiplicity(1, undefined);
}

export class Variable {
  name!: string;
  multiplicity!: Multiplicity;
  _class!: string;

  static readonly serialization = new SerializationFactory(
    createModelSchema(Variable, {
      name: primitive(),
      multiplicity: usingModelSchema(Multiplicity.serialization.schema),
      _class: primitive(),
    }),
  );
}
