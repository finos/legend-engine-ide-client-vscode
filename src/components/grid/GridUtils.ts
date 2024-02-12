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

import type {
  TDSLegendExecutionResult,
  TabularDataSet,
} from '../../results/TDSLegendExecutionResult';
import { isBoolean } from '../../utils/AssertionUtils';
import { PRIMITIVE_TYPE } from '../../utils/Const';

export type TDSResultCellDataType =
  | string
  | number
  | boolean
  | null
  | undefined;

export interface TDSRowDataType {
  [key: string]: TDSResultCellDataType;
}

export const getAggregationTDSColumnCustomizations = (
  isAgGridLicenseEnabled: boolean,
  result: TDSLegendExecutionResult,
  columnName: string,
): object => {
  if (!isAgGridLicenseEnabled) {
    return {};
  }
  const columnType = result.builder.columns.find(
    (col) => col.name === columnName,
  )?.type;
  switch (columnType) {
    case PRIMITIVE_TYPE.STRING:
      return {
        filter: 'agTextColumnFilter',
        allowedAggFuncs: ['count'],
      };
    case PRIMITIVE_TYPE.DATE:
    case PRIMITIVE_TYPE.DATETIME:
    case PRIMITIVE_TYPE.STRICTDATE:
      return {
        filter: 'agDateColumnFilter',
        allowedAggFuncs: ['count'],
      };
    case PRIMITIVE_TYPE.DECIMAL:
    case PRIMITIVE_TYPE.INTEGER:
    case PRIMITIVE_TYPE.FLOAT:
      return {
        filter: 'agNumberColumnFilter',
        allowedAggFuncs: ['count', 'sum', 'max', 'min', 'avg'],
      };
    default:
      return {
        allowedAggFuncs: ['count'],
      };
  }
};

export const getDefaultColumnDefintions = (
  isAgGridLicenseEnabled: boolean,
): object => {
  if (isAgGridLicenseEnabled) {
    return {
      minWidth: 50,
      sortable: true,
      resizable: true,
      enableRowGroup: true,
      enableValue: true,
      menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
    };
  } else {
    return {
      minWidth: 50,
      sortable: true,
      resizable: true,
      menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
    };
  }
};

export const getTDSRowData = (tds: TabularDataSet): TDSRowDataType[] =>
  tds.rows.map((_row, rowIdx) => {
    const row: TDSRowDataType = {};
    const cols = tds.columns;
    _row.values.forEach((value, colIdx) => {
      // `ag-grid` shows `false` value as empty string so we have
      // call `.toString()` to avoid this behavior.
      row[cols[colIdx] as string] = isBoolean(value) ? String(value) : value;
    });
    row.rowNumber = rowIdx;
    return row;
  });
