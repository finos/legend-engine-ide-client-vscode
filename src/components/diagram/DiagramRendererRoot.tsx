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
import { createRoot } from 'react-dom/client';
import { DiagramRendererComponent } from '@finos/legend-vscode-extension-dependencies';
import { type PlainObject } from '../../utils/SerializationUtils';

const rootElement = document.getElementById('root');
const inputParamtersFromHtml = rootElement
  ? rootElement.getAttribute('data-input-parameters')
  : '';
if (inputParamtersFromHtml) {
  const parsedParams = JSON.parse(inputParamtersFromHtml) as PlainObject;

  createRoot(rootElement as HTMLElement).render(
    <DiagramRendererComponent
      diagramId={parsedParams.diagramId as string}
      presets={[]}
    />,
  );
}
