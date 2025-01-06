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

import '@finos/legend-vscode-extension-dependencies/style/index.css';
import { type Root, createRoot } from 'react-dom/client';
import type { ActivationFunction } from 'vscode-notebook-renderer';
import { PurebookCubeRenderer } from './PurebookCubeRenderer';
import { PlainObject, uuid } from '@finos/legend-vscode-extension-dependencies';

export const activate: ActivationFunction = (context) => {
  const roots: Record<string, Root> = {};

  return {
    renderOutputItem(data, element) {
      if (!context.postMessage) {
        throw new Error(
          'vscode extension context postMessage is required to render Purebook Datacube',
        );
      }
      if (!context.onDidReceiveMessage) {
        throw new Error(
          'vscode extension context onDidReceiveMessage is required to render Purebook Datacube',
        );
      }
      const rootToUnmount: Root | undefined = roots[data.id];
      if (rootToUnmount !== undefined) {
        rootToUnmount.unmount();
      }
      const newRoot = createRoot(element);
      roots[data.id] = newRoot;

      const cellUri = data.json().cellUri;
      const lambda = data.json().lambda;

      const postAndWaitForMessage = async <T,>(
        requestMessage: { command: string; msg?: PlainObject },
        responseCommandId: string,
      ): Promise<T> => {
        const messageId = uuid();
        context.postMessage!({
          command: requestMessage.command,
          msg: requestMessage.msg,
          cellUri,
          messageId,
        });
        return new Promise((resolve) => {
          context.onDidReceiveMessage!((message) => {
            if (
              message.command === responseCommandId &&
              message.messageId === messageId
            ) {
              resolve(message.result as T);
            }
          });
        });
      };

      newRoot.render(
        <PurebookCubeRenderer
          cellUri={cellUri}
          lambda={lambda}
          postMessage={context.postMessage}
          postAndWaitForMessage={postAndWaitForMessage}
        />,
      );
    },
  };
};
