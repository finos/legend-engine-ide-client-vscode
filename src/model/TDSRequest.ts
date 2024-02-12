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

export enum TDS_FILTER_OPERATION {
  EQUALS = 'equals',
  NOT_EQUAL = 'notEqual',
  GREATER_THAN = 'greaterThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN = 'lessThan',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  BLANK = 'blank',
  NOT_BLANK = 'notBlank',
}

export enum TDS_AGGREGATION_FUNCTION {
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  AVG = 'avg',
  FIRST = 'first',
  LAST = 'last',
}

export enum TDS_SORT_ORDER {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export enum FILTER_TYPE {
  TEXT = 'text',
  NUMBER = 'number',
}

export class TDSFilter {
  column!: string;
  operation!: TDS_FILTER_OPERATION;
  value!: unknown;

  constructor(column: string, operation: TDS_FILTER_OPERATION, value: unknown) {
    this.column = column;
    this.operation = operation;
    this.value = value;
  }
}

export class TDSSort {
  column!: string;
  order!: TDS_SORT_ORDER;

  constructor(column: string, order: TDS_SORT_ORDER) {
    this.column = column;
    this.order = order;
  }
}

export class TDSAggregation {
  column!: string;
  function!: TDS_AGGREGATION_FUNCTION;

  constructor(column: string, _function: TDS_AGGREGATION_FUNCTION) {
    this.column = column;
    this.function = _function;
  }
}

export class TDSGroupby {
  columns!: string[];
  aggregations!: TDSAggregation[];

  constructor(columns: string[], aggregations: TDSAggregation[]) {
    this.columns = columns;
    this.aggregations = aggregations;
  }
}

export class LegendTDSRequest {
  startRow?: number | undefined;
  endRow?: number | undefined;
  columns!: string[];
  filter!: TDSFilter[];
  sort!: TDSSort[];
  groupBy!: TDSGroupby[];

  constructor(
    columns: string[],
    filter: TDSFilter[],
    sort: TDSSort[],
    groupBy: TDSGroupby[],
    startRow?: number | undefined,
    endRow?: number | undefined,
  ) {
    this.startRow = startRow;
    this.endRow = endRow;
    this.columns = columns;
    this.filter = filter;
    this.sort = sort;
    this.groupBy = groupBy;
  }
}
