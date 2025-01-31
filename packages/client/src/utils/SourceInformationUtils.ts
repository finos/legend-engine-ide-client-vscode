/**
 * Copyright (c) 2024-present, Goldman Sachs
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

import { V1_SourceInformation } from '@finos/legend-graph';
import { type TextLocation } from '@finos/legend-engine-ide-client-vscode-shared';

export const textLocationToSourceInformation = (
  textLocation: TextLocation,
): V1_SourceInformation => {
  const sourceInformation = new V1_SourceInformation();
  sourceInformation.sourceId = textLocation.documentId;
  sourceInformation.startLine = textLocation.textInterval.start.line + 1;
  sourceInformation.endLine = textLocation.textInterval.end.line + 1;
  sourceInformation.startColumn = textLocation.textInterval.start.column + 1;
  sourceInformation.endColumn = textLocation.textInterval.end.column + 1;
  return sourceInformation;
};
