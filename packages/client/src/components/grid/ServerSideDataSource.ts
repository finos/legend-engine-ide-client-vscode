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
  FilterModel,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
  type INTERNAL__TDSColumn,
  type PRIMITIVE_TYPE,
  type TDSLegendExecutionResult,
  type TDSRowDataType,
  GET_TDS_REQUEST_RESULTS_ID,
  getAggregationFunction,
  getTDSFilterOperation,
  getTDSRowData,
  getTDSSortOrder,
  LegendTDSRequest,
  SEND_TDS_REQUEST_ID,
  TDSAggregation,
  TDSFilter,
  TDSGroupby,
  TDSSort,
} from '@finos/legend-engine-ide-client-vscode-shared';
import { guaranteeNonNullable } from '@finos/legend-vscode-extension-dependencies';
import { postMessage } from '../../utils/VsCodeUtils';

export class ServerSideDataSource implements IServerSideDatasource {
  executions = 0;
  rowData: TDSRowDataType[] = [];
  columns: INTERNAL__TDSColumn[] = [];

  constructor(
    rowData?: TDSRowDataType[] | undefined,
    columns?: INTERNAL__TDSColumn[] | undefined,
  ) {
    this.rowData = rowData ?? [];
    this.columns = columns ?? [];
  }

  fetchRows(params: IServerSideGetRowsParams<unknown, unknown>): void {
    if (this.executions > 0) {
      postMessage({
        command: SEND_TDS_REQUEST_ID,
        values: this.extractRequest(params),
      });
      let rowData: TDSRowDataType[] = [];
      let count = 0;
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.command === GET_TDS_REQUEST_RESULTS_ID) {
          // This check is to make sure we only set rowData once when we get results back from server
          if (count === 0) {
            const result: TDSLegendExecutionResult = message.result;
            rowData = getTDSRowData(result.result);
            params.success({ rowData: rowData });
            count++;
          }
        }
      });
    } else {
      params.success({ rowData: this.rowData });
    }
    this.executions++;
  }

  getRows(params: IServerSideGetRowsParams<unknown, unknown>): void {
    this.fetchRows(params);
  }

  extractRequest(
    params: IServerSideGetRowsParams<unknown, unknown>,
  ): LegendTDSRequest {
    const request = params.request;
    const startRow = request.startRow;
    const endRow = request.endRow;
    const columns = params.api.getColumns()?.map((c) => c.getColId());
    const sort = request.sortModel.map(
      (i) => new TDSSort(i.colId, getTDSSortOrder(i.sort)),
    );
    const aggregations = request.valueCols.map((v) => {
      const colType = this.columns.find((c) => c.name === v.field)?.type;
      return new TDSAggregation(
        guaranteeNonNullable(v.field),
        colType as PRIMITIVE_TYPE,
        getAggregationFunction(guaranteeNonNullable(v.aggFunc)),
      );
    });
    const groupBy = new TDSGroupby(
      request.rowGroupCols.map((r) => r.id),
      request.groupKeys,
      aggregations,
    );
    const filter: TDSFilter[] = [];
    const filterModel = request.filterModel as FilterModel;
    if (filterModel) {
      Object.keys(filterModel).forEach((key) => {
        const item = filterModel[key];
        const colType = this.columns.find((c) => c.name === key)?.type;
        if (item.filter === undefined) {
          throw new Error('Nested filtering is not supported yet');
        }
        filter.push(
          new TDSFilter(
            key,
            colType as PRIMITIVE_TYPE,
            getTDSFilterOperation(item.type),
            item.filter,
          ),
        );
      });
    }
    const tdsRequest = new LegendTDSRequest(
      columns ?? [],
      filter,
      sort,
      groupBy,
      startRow,
      endRow,
    );
    return tdsRequest;
  }
}
