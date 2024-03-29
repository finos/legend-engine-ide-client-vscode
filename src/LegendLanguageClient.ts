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

import type { CancellationToken } from 'vscode';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import type { LegendExecutionResult } from './results/LegendExecutionResult';
import { REPL_CLASSPATH_REQUEST_ID, TDS_JSON_REQUEST_ID } from './utils/Const';
import type { PlainObject } from './utils/SerializationUtils';
import { LanguageClient } from 'vscode-languageclient/node';

export class LegendLanguageClient extends LanguageClient {
  async sendTDSRequest(
    request: FunctionTDSRequest,
  ): Promise<PlainObject<LegendExecutionResult>> {
    return this.sendRequest(TDS_JSON_REQUEST_ID, request);
  }

  async replClasspath(token?: CancellationToken): Promise<string> {
    return this.sendRequest(REPL_CLASSPATH_REQUEST_ID, token);
  }
}
