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
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from '@ag-grid-community/core';
import {
  TDSGroupby,
  type TDS_AGGREGATION_FUNCTION,
  type TDS_SORT_ORDER,
  TDSAggregation,
  type TDSFilter,
  LegendTDSRequest,
  TDSSort,
} from '../../model/TDSRequest';
import { guaranteeNonNullable } from '../../utils/AssertionUtils';
import { postMessage } from '../../utils/VsCodeUtils';
import type { TDSLegendExecutionResult } from '../../results/TDSLegendExecutionResult';
import {
  GET_TDS_REQUEST_RESULTS_ID,
  SEND_TDS_REQUEST_ID,
} from '../../utils/Const';
import { type TDSRowDataType, getTDSRowData } from './GridUtils';

export class ServerSideDataSource implements IServerSideDatasource {
  executions = 0;
  rowData: TDSRowDataType[] = [];

  constructor(rowData?: TDSRowDataType[] | undefined) {
    this.rowData = rowData ?? [];
  }

  fetchRows(params: IServerSideGetRowsParams<unknown, unknown>): void {
    if (this.executions > 0) {
      postMessage({
        command: SEND_TDS_REQUEST_ID,
        values: this.extractRequest(params),
      });
      let rowData: TDSRowDataType[] = [];
      window.addEventListener('message', (event) => {
        const message = event.data;
        if (message.command === GET_TDS_REQUEST_RESULTS_ID) {
          const result: TDSLegendExecutionResult = message.result;
          rowData = getTDSRowData(result.result);
          params.success({ rowData: rowData });
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
    const columns = params.columnApi.getColumns()?.map((c) => c.getColId());
    const sort = request.sortModel.map(
      (i) => new TDSSort(i.colId, i.sort as TDS_SORT_ORDER),
    );
    const aggregations = request.valueCols.map(
      (v) =>
        new TDSAggregation(
          guaranteeNonNullable(v.field),
          guaranteeNonNullable(v.aggFunc) as TDS_AGGREGATION_FUNCTION,
        ),
    );
    const groupBy = new TDSGroupby(
      aggregations.map((a) => a.column),
      aggregations,
    );
    const filter: TDSFilter[] = [];
    const filterModel = request.filterModel;
    if (filterModel) {
      Object.keys(filterModel).forEach((key) => {
        const item = filterModel[key];
        filter.push({
          operation: item.type,
          value: item.filter,
          column: key,
        } as TDSFilter);
      });
    }
    const tdsRequest = new LegendTDSRequest(
      columns ?? [],
      filter,
      sort,
      [groupBy],
      startRow,
      endRow,
    );
    return tdsRequest;
  }
}
