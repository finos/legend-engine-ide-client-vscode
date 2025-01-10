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
import type { PRIMITIVE_TYPE } from '../utils/Const';
export declare enum TDS_FILTER_OPERATION {
    EQUALS = "EQUALS",
    NOT_EQUAL = "NOT_EQUAL",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
    BLANK = "BLANK",
    NOT_BLANK = "NOT_BLANK"
}
export declare enum TDS_AGGREGATION_FUNCTION {
    SUM = "SUM",
    MIN = "MIN",
    MAX = "MAX",
    COUNT = "COUNT",
    AVG = "AVG",
    FIRST = "FIRST",
    LAST = "LAST"
}
export declare enum TDS_SORT_ORDER {
    ASCENDING = "ASCENDING",
    DESCENDING = "DESCENDING"
}
export declare enum FILTER_TYPE {
    TEXT = "text",
    NUMBER = "number"
}
export declare class TDSFilter {
    column: string;
    columnType: PRIMITIVE_TYPE;
    operation: TDS_FILTER_OPERATION;
    value: unknown;
    constructor(column: string, columnType: PRIMITIVE_TYPE, operation: TDS_FILTER_OPERATION, value: unknown);
}
export declare class TDSSort {
    column: string;
    order: TDS_SORT_ORDER;
    constructor(column: string, order: TDS_SORT_ORDER);
}
export declare class TDSAggregation {
    column: string;
    columnType: PRIMITIVE_TYPE;
    function: TDS_AGGREGATION_FUNCTION;
    constructor(column: string, columnType: PRIMITIVE_TYPE, _function: TDS_AGGREGATION_FUNCTION);
}
export declare class TDSGroupby {
    columns: string[];
    groupKeys: string[];
    aggregations: TDSAggregation[];
    constructor(columns: string[], groupKeys: string[], aggregations: TDSAggregation[]);
}
export declare class LegendTDSRequest {
    startRow?: number | undefined;
    endRow?: number | undefined;
    columns: string[];
    filter: TDSFilter[];
    sort: TDSSort[];
    groupBy: TDSGroupby;
    constructor(columns: string[], filter: TDSFilter[], sort: TDSSort[], groupBy: TDSGroupby, startRow?: number | undefined, endRow?: number | undefined);
}
//# sourceMappingURL=TDSRequest.d.ts.map