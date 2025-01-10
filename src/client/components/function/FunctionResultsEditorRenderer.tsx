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
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import { createRoot } from 'react-dom/client';
import {
  type PlainObject,
  deserializeMap,
} from '@finos/legend-vscode-extension-dependencies';
import { InputParamter } from '../../model/InputParameter';
import { configureAgGridComponent } from '../grid/AgGrid';
import { FunctionResultsEditor } from './FunctionResultsEditor';

configureAgGridComponent();
const rootElement = document.getElementById('root');
const inputParamtersFromHtml = rootElement
  ? rootElement.getAttribute('data-input-parameters')
  : '';
const isDarkTheme = rootElement
  ? rootElement.getAttribute('data-is-dark-theme')
  : 'false';
const agGridLicense = rootElement
  ? rootElement.getAttribute('data-ag-grid-license')
  : '';

if (inputParamtersFromHtml) {
  const input = JSON.parse(inputParamtersFromHtml) as unknown[];
  const inputP = input[5] as Record<string, PlainObject<InputParamter>>;
  const inputParameters = deserializeMap(
    inputP,
    (json: PlainObject<InputParamter>): InputParamter =>
      InputParamter.serialization.fromJson(json),
  );
  createRoot(rootElement as HTMLElement).render(
    <FunctionResultsEditor
      agGridLicense={agGridLicense ?? ''}
      isDarkTheme={isDarkTheme === 'true' ? true : false}
      inputParameters={Array.from(inputParameters.values())}
    />,
  );
}
