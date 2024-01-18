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

import {
  AgGridReact,
  type AgGridReactProps,
  type AgReactUiProps,
} from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ModuleRegistry } from '@ag-grid-community/core';

const communityModules = [ClientSideRowModelModule, CsvExportModule];

export function AgGridComponent<TData = unknown>(
  props: AgGridReactProps<TData> | AgReactUiProps<TData>,
): JSX.Element {
  return (
    <AgGridReact
      suppressBrowserResizeObserver={true}
      suppressScrollOnNewData={true}
      rowSelection="multiple"
      enableRangeSelection={true}
      {...props}
      modules={communityModules}
    />
  );
}

export const configureAgGridComponent = (): void => {
  ModuleRegistry.registerModules([ClientSideRowModelModule]);
};
