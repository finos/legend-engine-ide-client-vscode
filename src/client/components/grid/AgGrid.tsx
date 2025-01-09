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

import { AgGridReact, type AgGridReactProps } from 'ag-grid-react';
import {
  ClientSideRowModelModule,
  CsvExportModule,
  ModuleRegistry,
} from 'ag-grid-community';
import {
  ServerSideRowModelModule,
  RowGroupingModule,
  MenuModule,
  LicenseManager,
} from 'ag-grid-enterprise';
import { type TDSRowDataType, getDefaultColumnDefintions } from '../../../shared/utils/GridUtils';
import { ServerSideDataSource } from './ServerSideDataSource';
import { type INTERNAL__TDSColumn } from '../../../shared/model/TDSLegendExecutionResult';
import { type JSX } from 'react';

const communityModules = [ClientSideRowModelModule, CsvExportModule];
const enterpriseModules = [
  ServerSideRowModelModule,
  RowGroupingModule,
  MenuModule,
];
const allModules = communityModules.concat(enterpriseModules);

export function AgGridComponent<TData = unknown>(
  props: AgGridReactProps<TData> & {
    licenseKey: string;
    columns: INTERNAL__TDSColumn[];
  },
): JSX.Element {
  let isAgGridLicenseEnabled = false;
  if (props.licenseKey) {
    LicenseManager.setLicenseKey(props.licenseKey);
    isAgGridLicenseEnabled = true;
  }
  const server = new ServerSideDataSource(
    props.rowData as TDSRowDataType[],
    props.columns,
  );
  return (
    <AgGridReact
      rowGroupPanelShow={isAgGridLicenseEnabled ? 'always' : 'never'}
      suppressBrowserResizeObserver={true}
      suppressScrollOnNewData={true}
      rowSelection="multiple"
      enableRangeSelection={true}
      gridOptions={{
        serverSideDatasource: server,
      }}
      rowModelType={isAgGridLicenseEnabled ? 'serverSide' : 'clientSide'}
      {...props}
      defaultColDef={getDefaultColumnDefintions(isAgGridLicenseEnabled)}
      modules={isAgGridLicenseEnabled ? allModules : communityModules}
    />
  );
}

export const configureAgGridComponent = (): void => {
  ModuleRegistry.registerModules([ClientSideRowModelModule]);
};
