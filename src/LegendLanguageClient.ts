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

import type { CancellationToken, Uri } from 'vscode';
import type { FunctionTDSRequest } from './model/FunctionTDSRequest';
import type { LegendExecutionResult } from './results/LegendExecutionResult';
import {
  REPL_CLASSPATH_REQUEST_ID,
  TDS_JSON_REQUEST_ID,
  TEST_CASES_REQUEST_ID,
  EXECUTE_TESTS_REQUEST_ID,
  VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID,
  ENTITIES_REQUEST_ID,
} from './utils/Const';
import type { PlainObject } from './utils/SerializationUtils';
import {
  LanguageClient,
  type TextDocumentIdentifier,
} from 'vscode-languageclient/node';
import type { LegendTest } from './model/LegendTest';
import type { ExecuteTestRequest } from './model/ExecuteTestRequest';
import type { LegendTestExecutionResult } from './model/LegendTestExecutionResult';
import { LegendEntity } from './model/LegendEntity';

export class LegendEntitiesRequest {
  private textDocuments!: TextDocumentIdentifier[];

  constructor(textDocuments: TextDocumentIdentifier[]) {
    this.textDocuments = textDocuments;
  }
}

export class LegendLanguageClient extends LanguageClient {
  async sendTDSRequest(
    request: FunctionTDSRequest,
  ): Promise<PlainObject<LegendExecutionResult>> {
    return this.sendRequest(TDS_JSON_REQUEST_ID, request);
  }

  async replClasspath(token?: CancellationToken): Promise<string> {
    if (token) {
      return this.sendRequest(REPL_CLASSPATH_REQUEST_ID, token);
    } else {
      return this.sendRequest(REPL_CLASSPATH_REQUEST_ID);
    }
  }

  async testCases(
    token?: CancellationToken,
  ): Promise<PlainObject<LegendTest>[]> {
    if (token) {
      return this.sendRequest(TEST_CASES_REQUEST_ID, token);
    } else {
      return this.sendRequest(TEST_CASES_REQUEST_ID);
    }
  }

  async executeTests(
    req: ExecuteTestRequest,
    token?: CancellationToken,
  ): Promise<PlainObject<LegendTestExecutionResult>[]> {
    if (token) {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, req, token);
    } else {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, req);
    }
  }

  async legendVirtualFile(
    uri: Uri,
    token?: CancellationToken,
  ): Promise<string> {
    if (token) {
      return this.sendRequest(
        VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID,
        uri.toString(),
        token,
      );
    } else {
      return this.sendRequest(EXECUTE_TESTS_REQUEST_ID, uri.toString());
    }
  }

  async entities(
    request: LegendEntitiesRequest,
    token?: CancellationToken,
  ): Promise<LegendEntity[]> {
    let promise: Promise<PlainObject<LegendTestExecutionResult>[]>;

    if (token) {
      promise = this.sendRequest<PlainObject<LegendTestExecutionResult>[]>(
        ENTITIES_REQUEST_ID,
        request,
        token,
      );
    } else {
      promise = this.sendRequest<PlainObject<LegendTestExecutionResult>[]>(
        ENTITIES_REQUEST_ID,
        request,
      );
    }

    return promise.then((res) =>
      res.map((x) => LegendEntity.serialization.fromJson(x)),
    );
  }
}
