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

import { usingModelSchema } from '@finos/legend-vscode-extension-dependencies';
import {
  type PureProtocolProcessorPlugin,
  type V1_DatasetSpecification,
  type V1_RawLambda,
  V1_deserializeDatasetSpecification,
  V1_rawLambdaModelSchema,
  V1_serializeDatasetSpecification,
} from '@finos/legend-graph/cjs';
import {
  type ModelSchema,
  createModelSchema,
  custom,
  list,
  optional,
  primitive,
} from 'serializr';

export class V1_LSPEntitlementReportAnallyticsInput {
  lambda?: V1_RawLambda | undefined;
  mapping!: string;
  runtime!: string;
  reports: V1_DatasetSpecification[] = [];
}

export const V1_LSPEntitlementReportAnallyticsInputModelSchema = (
  plugins: PureProtocolProcessorPlugin[],
): ModelSchema<V1_LSPEntitlementReportAnallyticsInput> =>
  createModelSchema(V1_LSPEntitlementReportAnallyticsInput, {
    lambda: usingModelSchema(V1_rawLambdaModelSchema),
    mapping: optional(primitive()),
    runtime: optional(primitive()),
    reports: list(
      custom(
        (val) => V1_serializeDatasetSpecification(val, plugins),
        (val) => V1_deserializeDatasetSpecification(val, plugins),
      ),
    ),
  });
