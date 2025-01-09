/**
 * Copyright (c) 2020-present, Goldman Sachs
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
  createModelSchema,
  createSimpleSchema,
  list,
  optional,
  primitive,
  raw,
} from 'serializr';
import {
  type Entity,
  SerializationFactory,
  usingModelSchema,
  V1_MappedEntity,
} from '@finos/legend-vscode-extension-dependencies';

export class V1_LSPMappingModelCoverageAnalysisResult {
  mappedEntities: V1_MappedEntity[] = [];
  modelEntities?: Entity[] | undefined;

  static readonly serialization = new SerializationFactory(
    createModelSchema(V1_LSPMappingModelCoverageAnalysisResult, {
      mappedEntities: list(
        usingModelSchema(V1_MappedEntity.serialization.schema),
      ),
      modelEntities: optional(
        list(
          usingModelSchema(
            createSimpleSchema({
              classifierPath: primitive(),
              path: primitive(),
              content: raw(),
            }),
          ),
        ),
      ),
    }),
  );
}
