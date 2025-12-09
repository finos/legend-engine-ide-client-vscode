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
  SerializationFactory,
  usingConstantValueSchema,
} from '@finos/legend-shared';
import { createModelSchema, primitive } from 'serializr';
import { DataCubeSource } from '@finos/legend-vscode-extension-dependencies';

export class LSPDataCubeSource extends DataCubeSource {}
export const LSP_DATA_CUBE_SOURCE_TYPE = 'lspDataCubeSource';

export class RawLSPDataCubeSource {
  query!: string;

  static readonly serialization = new SerializationFactory(
    createModelSchema(RawLSPDataCubeSource, {
      _type: usingConstantValueSchema(LSP_DATA_CUBE_SOURCE_TYPE),
      query: primitive(),
    }),
  );
}
