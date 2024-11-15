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

import { type Location } from 'vscode';
import { TextLocation } from '../model/TextLocation';

export const locationToTextLocation = (location: Location): TextLocation =>
  TextLocation.serialization.fromJson({
    documentId: location.uri.toString(),
    textInterval: {
      start: {
        line: location.range.start.line,
        column: location.range.start.character,
      },
      end: {
        line: location.range.end.line,
        column: location.range.end.character,
      },
    },
  });
