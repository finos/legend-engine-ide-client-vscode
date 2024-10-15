import {
  customListWithSchema,
  SerializationFactory,
  usingModelSchema,
  type V1_ParameterValue,
  V1_parameterValueModelSchema,
  type V1_RawLambda,
  V1_rawLambdaModelSchema,
  type V1_Runtime,
  V1_serializeRuntime,
  V1_RawExecutionContext,
  V1_rawBaseExecutionContextModelSchema,
} from '@finos/legend-vscode-extension-dependencies';
import {
  createModelSchema,
  custom,
  optional,
  primitive,
  SKIP,
} from 'serializr';

export class ExecuteQueryInput {
  lambda!: V1_RawLambda;
  mapping: string | undefined;
  runtime: V1_Runtime | undefined;
  context!: V1_RawExecutionContext;
  parameterValues: V1_ParameterValue[] = [];

  static readonly serialization = new SerializationFactory(
    createModelSchema(ExecuteQueryInput, {
      lambda: usingModelSchema(V1_rawLambdaModelSchema),
      mapping: optional(primitive()),
      runtime: custom(
        (val) => (val ? V1_serializeRuntime(val) : SKIP),
        () => SKIP,
      ),
      context: usingModelSchema(V1_rawBaseExecutionContextModelSchema),
      parameterValues: customListWithSchema(V1_parameterValueModelSchema),
    }),
  );
}
