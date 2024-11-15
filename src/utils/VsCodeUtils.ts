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

import { type PlainObject } from './SerializationUtils';

interface Vscode {
  postMessage(message: unknown): void;
}

declare const vscode: Vscode;

export const postMessage = (message: unknown): void => {
  vscode.postMessage(message);
};

export const postAndWaitForMessage = <T>(
  requestMessage: { command: string; msg?: PlainObject },
  responseCommandId: string,
): Promise<T> => {
  postMessage({
    command: requestMessage.command,
    msg: requestMessage.msg,
  });
  return new Promise((resolve) => {
    const handleMessage = (
      event: MessageEvent<{ result: T; command: string }>,
    ): void => {
      if (event.data.command === responseCommandId) {
        window.removeEventListener('message', handleMessage);
        resolve(event.data.result);
      }
    };
    window.addEventListener('message', handleMessage);
  });
};
