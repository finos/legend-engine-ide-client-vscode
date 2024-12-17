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

import '@finos/legend-vscode-extension-dependencies/style/index.css';
import { type Root, createRoot } from 'react-dom/client';
import type { ActivationFunction } from 'vscode-notebook-renderer';
import { PurebookCubeRenderer } from './PurebookCubeRenderer';

export const activate: ActivationFunction = (context) => {
  let root: Root | null = null;

  return {
    renderOutputItem(data, element) {
      if (!context.postMessage) {
        throw new Error(
          'vscode extension context postMessage is required to render Purebook cube',
        );
      }
      if (!context.onDidReceiveMessage) {
        throw new Error(
          'vscode extension context onDidReceiveMessage is required to render Purebook cube',
        );
      }
      if (root) {
        root.unmount();
      }
      root = createRoot(element);
      root.render(
        <PurebookCubeRenderer
          cellUri={data.json().cellUri}
          lambda={data.json().lambda}
          postMessage={context.postMessage}
          onDidReceiveMessage={context.onDidReceiveMessage}
        />,
      );
    },
  };
};
