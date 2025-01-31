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
  SerializationFactory,
  usingModelSchema,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type V1_RawLambda,
  V1_rawLambdaModelSchema,
  type V1_Runtime,
  V1_serializeRuntime,
  type V1_RawExecutionContext,
  V1_rawBaseExecutionContextModelSchema,
  type EXECUTION_SERIALIZATION_FORMAT,
} from '@finos/legend-graph/cjs';
import { createModelSchema, custom, map, raw } from 'serializr';

export class V1_LSPExecuteInput {
  lambda!: V1_RawLambda;
  mapping: string | undefined;
  runtime: V1_Runtime | undefined;
  context!: V1_RawExecutionContext;
  parameterValues: { [key: string]: unknown } = {};
  serializationFormat: EXECUTION_SERIALIZATION_FORMAT | undefined;

  static readonly serialization = new SerializationFactory(
    createModelSchema(V1_LSPExecuteInput, {
      lambda: usingModelSchema(V1_rawLambdaModelSchema),
      mapping: custom(
        (val) => (val ? val : undefined),
        () => undefined,
      ),
      runtime: custom(
        (val) => (val ? V1_serializeRuntime(val) : undefined),
        () => undefined,
      ),
      context: usingModelSchema(V1_rawBaseExecutionContextModelSchema),
      parameterValues: map(raw()),
      serializationFormat: custom(
        (val) => (val ? val : undefined),
        () => undefined,
      ),
    }),
  );
}
