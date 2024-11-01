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
