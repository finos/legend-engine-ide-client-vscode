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

import { createRoot } from 'react-dom/client';
import { AgGridComponent, configureAgGridComponent } from './AgGrid';

configureAgGridComponent();
const rootElement = document.getElementById('root');
const rowDataString = rootElement
  ? rootElement.getAttribute('data-row-data')
  : [];
const columnDefsString = rootElement
  ? rootElement.getAttribute('data-column-defs')
  : [];
const isDarkTheme = rootElement
  ? rootElement.getAttribute('data-is-dark-theme')
  : 'false';
if (rowDataString && columnDefsString) {
  const rowData = JSON.parse(rowDataString as string);
  const columnDefs = JSON.parse(columnDefsString as string);
  createRoot(rootElement as HTMLElement).render(
    <AgGridComponent
      className={
        isDarkTheme === 'true' ? 'ag-theme-balham-dark' : 'ag-theme-balham'
      }
      rowData={rowData}
      columnDefs={columnDefs}
    />,
  );
}
