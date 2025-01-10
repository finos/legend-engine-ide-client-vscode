"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegendTDSRequest = exports.TDSGroupby = exports.TDSAggregation = exports.TDSSort = exports.TDSFilter = exports.FILTER_TYPE = exports.TDS_SORT_ORDER = exports.TDS_AGGREGATION_FUNCTION = exports.TDS_FILTER_OPERATION = void 0;
var TDS_FILTER_OPERATION;
(function (TDS_FILTER_OPERATION) {
    TDS_FILTER_OPERATION["EQUALS"] = "EQUALS";
    TDS_FILTER_OPERATION["NOT_EQUAL"] = "NOT_EQUAL";
    TDS_FILTER_OPERATION["GREATER_THAN"] = "GREATER_THAN";
    TDS_FILTER_OPERATION["GREATER_THAN_OR_EQUAL"] = "GREATER_THAN_OR_EQUAL";
    TDS_FILTER_OPERATION["LESS_THAN"] = "LESS_THAN";
    TDS_FILTER_OPERATION["LESS_THAN_OR_EQUAL"] = "LESS_THAN_OR_EQUAL";
    TDS_FILTER_OPERATION["BLANK"] = "BLANK";
    TDS_FILTER_OPERATION["NOT_BLANK"] = "NOT_BLANK";
})(TDS_FILTER_OPERATION || (exports.TDS_FILTER_OPERATION = TDS_FILTER_OPERATION = {}));
var TDS_AGGREGATION_FUNCTION;
(function (TDS_AGGREGATION_FUNCTION) {
    TDS_AGGREGATION_FUNCTION["SUM"] = "SUM";
    TDS_AGGREGATION_FUNCTION["MIN"] = "MIN";
    TDS_AGGREGATION_FUNCTION["MAX"] = "MAX";
    TDS_AGGREGATION_FUNCTION["COUNT"] = "COUNT";
    TDS_AGGREGATION_FUNCTION["AVG"] = "AVG";
    TDS_AGGREGATION_FUNCTION["FIRST"] = "FIRST";
    TDS_AGGREGATION_FUNCTION["LAST"] = "LAST";
})(TDS_AGGREGATION_FUNCTION || (exports.TDS_AGGREGATION_FUNCTION = TDS_AGGREGATION_FUNCTION = {}));
var TDS_SORT_ORDER;
(function (TDS_SORT_ORDER) {
    TDS_SORT_ORDER["ASCENDING"] = "ASCENDING";
    TDS_SORT_ORDER["DESCENDING"] = "DESCENDING";
})(TDS_SORT_ORDER || (exports.TDS_SORT_ORDER = TDS_SORT_ORDER = {}));
var FILTER_TYPE;
(function (FILTER_TYPE) {
    FILTER_TYPE["TEXT"] = "text";
    FILTER_TYPE["NUMBER"] = "number";
})(FILTER_TYPE || (exports.FILTER_TYPE = FILTER_TYPE = {}));
class TDSFilter {
    constructor(column, columnType, operation, value) {
        Object.defineProperty(this, "column", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "columnType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.column = column;
        this.columnType = columnType;
        this.operation = operation;
        this.value = value;
    }
}
exports.TDSFilter = TDSFilter;
class TDSSort {
    constructor(column, order) {
        Object.defineProperty(this, "column", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.column = column;
        this.order = order;
    }
}
exports.TDSSort = TDSSort;
class TDSAggregation {
    constructor(column, columnType, _function) {
        Object.defineProperty(this, "column", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "columnType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "function", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.column = column;
        this.columnType = columnType;
        this.function = _function;
    }
}
exports.TDSAggregation = TDSAggregation;
class TDSGroupby {
    constructor(columns, groupKeys, aggregations) {
        Object.defineProperty(this, "columns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "groupKeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aggregations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.columns = columns;
        this.groupKeys = groupKeys;
        this.aggregations = aggregations;
    }
}
exports.TDSGroupby = TDSGroupby;
class LegendTDSRequest {
    constructor(columns, filter, sort, groupBy, startRow, endRow) {
        Object.defineProperty(this, "startRow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endRow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "columns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "groupBy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.startRow = startRow;
        this.endRow = endRow;
        this.columns = columns;
        this.filter = filter;
        this.sort = sort;
        this.groupBy = groupBy;
    }
}
exports.LegendTDSRequest = LegendTDSRequest;
//# sourceMappingURL=TDSRequest.js.map