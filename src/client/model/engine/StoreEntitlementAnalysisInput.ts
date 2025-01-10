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
  type V1_RawLambda,
  SerializationFactory,
  usingModelSchema,
  V1_rawLambdaModelSchema,
} from '@finos/legend-vscode-extension-dependencies';
import { createModelSchema, optional, primitive } from 'serializr';

export class V1_LSPStoreEntitlementAnalysisInput {
  lambda?: V1_RawLambda | undefined;
  mapping!: string;
  runtime!: string;

  static readonly serialization = new SerializationFactory(
    createModelSchema(V1_LSPStoreEntitlementAnalysisInput, {
      lambda: usingModelSchema(V1_rawLambdaModelSchema),
      mapping: optional(primitive()),
      runtime: optional(primitive()),
    }),
  );
}
