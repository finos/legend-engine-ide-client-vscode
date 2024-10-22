import {
  SerializationFactory,
  usingModelSchema,
  type V1_RawLambda,
  V1_rawLambdaModelSchema,
  type V1_Runtime,
  V1_serializeRuntime,
  type V1_RawExecutionContext,
  V1_rawBaseExecutionContextModelSchema,
  type EXECUTION_SERIALIZATION_FORMAT,
} from '@finos/legend-vscode-extension-dependencies';
import {
  createModelSchema,
  custom,
  map,
  optional,
  primitive,
  raw,
  SKIP,
} from 'serializr';

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
      mapping: optional(primitive()),
      runtime: custom(
        (val) => (val ? V1_serializeRuntime(val) : SKIP),
        () => SKIP,
      ),
      context: usingModelSchema(V1_rawBaseExecutionContextModelSchema),
      parameterValues: map(raw()),
      serializationFormat: custom(
        (val) => (val ? val : undefined),
        () => SKIP,
      ),
    }),
  );
}
