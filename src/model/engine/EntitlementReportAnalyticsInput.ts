import {
  type PureProtocolProcessorPlugin,
  type V1_DatasetSpecification,
  type V1_RawLambda,
  usingModelSchema,
  V1_deserializeDatasetSpecification,
  V1_rawLambdaModelSchema,
  V1_serializeDatasetSpecification,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type ModelSchema,
  createModelSchema,
  custom,
  list,
  optional,
  primitive,
} from 'serializr';

export class V1_LSPEntitlementReportAnallyticsInput {
  lambda!: V1_RawLambda;
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
