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
exports.getTDSRowData = exports.getDefaultColumnDefintions = exports.getAggregationTDSColumnCustomizations = exports.getFilterColumnType = exports.getTDSFilterOperation = exports.getAggregationFunction = exports.getTDSSortOrder = void 0;
const TDSRequest_1 = require("../model/TDSRequest");
const Const_1 = require("./Const");
const AssertionUtils_1 = require("./AssertionUtils");
const getTDSSortOrder = (sortOrder) => {
    switch (sortOrder) {
        case 'asc':
            return TDSRequest_1.TDS_SORT_ORDER.ASCENDING;
        case 'desc':
            return TDSRequest_1.TDS_SORT_ORDER.DESCENDING;
        default:
            throw new Error(`Unsupported tds sort order ${sortOrder}`);
    }
};
exports.getTDSSortOrder = getTDSSortOrder;
const getAggregationFunction = (aggFunc) => {
    switch (aggFunc) {
        case 'sum':
            return TDSRequest_1.TDS_AGGREGATION_FUNCTION.SUM;
        case 'min':
            return TDSRequest_1.TDS_AGGREGATION_FUNCTION.MIN;
        case 'max':
            return TDSRequest_1.TDS_AGGREGATION_FUNCTION.MAX;
        case 'count':
            return TDSRequest_1.TDS_AGGREGATION_FUNCTION.COUNT;
        default:
            throw new Error(`Unsupported aggregation function ${aggFunc}`);
    }
};
exports.getAggregationFunction = getAggregationFunction;
const getTDSFilterOperation = (filterOperation) => {
    switch (filterOperation) {
        case 'equals':
            return TDSRequest_1.TDS_FILTER_OPERATION.EQUALS;
        case 'notEqual':
            return TDSRequest_1.TDS_FILTER_OPERATION.NOT_EQUAL;
        case 'greaterThan':
            return TDSRequest_1.TDS_FILTER_OPERATION.GREATER_THAN;
        case 'greaterThanOrEqual':
            return TDSRequest_1.TDS_FILTER_OPERATION.GREATER_THAN_OR_EQUAL;
        case 'lessThan':
            return TDSRequest_1.TDS_FILTER_OPERATION.LESS_THAN;
        case 'lessThanOrEqual':
            return TDSRequest_1.TDS_FILTER_OPERATION.LESS_THAN_OR_EQUAL;
        case 'blank':
            return TDSRequest_1.TDS_FILTER_OPERATION.BLANK;
        case 'notBlank':
            return TDSRequest_1.TDS_FILTER_OPERATION.NOT_BLANK;
        default:
            throw new Error(`Unsupported filter operation ${filterOperation}`);
    }
};
exports.getTDSFilterOperation = getTDSFilterOperation;
const getFilterColumnType = (type) => {
    switch (type) {
        case 'text':
            return Const_1.PRIMITIVE_TYPE.STRING;
        case 'number':
            return Const_1.PRIMITIVE_TYPE.NUMBER;
        case 'boolean':
            return Const_1.PRIMITIVE_TYPE.BOOLEAN;
        case 'date':
            return Const_1.PRIMITIVE_TYPE.DATE;
        default:
            throw new Error(`Unsupported filter type ${type}`);
    }
};
exports.getFilterColumnType = getFilterColumnType;
const getAggregationTDSColumnCustomizations = (isAgGridLicenseEnabled, result, columnName) => {
    if (!isAgGridLicenseEnabled) {
        return {};
    }
    const columnType = result.builder.columns.find((col) => col.name === columnName)?.type;
    switch (columnType) {
        case Const_1.PRIMITIVE_TYPE.STRING:
            return {
                filter: 'agTextColumnFilter',
                allowedAggFuncs: ['count'],
            };
        case Const_1.PRIMITIVE_TYPE.DATE:
        case Const_1.PRIMITIVE_TYPE.DATETIME:
        case Const_1.PRIMITIVE_TYPE.STRICTDATE:
            return {
                filter: 'agDateColumnFilter',
                allowedAggFuncs: ['count'],
            };
        case Const_1.PRIMITIVE_TYPE.DECIMAL:
        case Const_1.PRIMITIVE_TYPE.INTEGER:
        case Const_1.PRIMITIVE_TYPE.FLOAT:
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
exports.getAggregationTDSColumnCustomizations = getAggregationTDSColumnCustomizations;
const getDefaultColumnDefintions = (isAgGridLicenseEnabled) => {
    if (isAgGridLicenseEnabled) {
        return {
            minWidth: 50,
            sortable: true,
            resizable: true,
            enableRowGroup: true,
            enableValue: true,
            menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
        };
    }
    else {
        return {
            minWidth: 50,
            sortable: true,
            resizable: true,
            menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
        };
    }
};
exports.getDefaultColumnDefintions = getDefaultColumnDefintions;
const getTDSRowData = (tds) => tds.rows.map((_row, rowIdx) => {
    const row = {};
    const cols = tds.columns;
    _row.values.forEach((value, colIdx) => {
        // `ag-grid` shows `false` value as empty string so we have
        // call `.toString()` to avoid this behavior.
        row[cols[colIdx]] = (0, AssertionUtils_1.isBoolean)(value) ? String(value) : value;
    });
    row.rowNumber = rowIdx;
    return row;
});
exports.getTDSRowData = getTDSRowData;
//# sourceMappingURL=GridUtils.js.map