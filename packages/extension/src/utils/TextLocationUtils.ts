/**
 * Copyright (c) 2025-present, Goldman Sachs
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

import { Location, Position, Range, Uri } from 'vscode';
import {
  type TextInterval,
  type TextLocation,
} from '@finos/legend-engine-ide-client-vscode-shared';

export const textIntervalToRange = (textInterval: TextInterval): Range =>
  new Range(
    new Position(textInterval.start.line, textInterval.start.column),
    new Position(textInterval.end.line, textInterval.end.column + 1),
  );

export const textLocationToUri = (textLocation: TextLocation): Uri =>
  Uri.parse(textLocation.documentId);

export const textLocationToLocation = (textLocation: TextLocation): Location =>
  new Location(
    textLocationToUri(textLocation),
    textIntervalToRange(textLocation.textInterval),
  );
