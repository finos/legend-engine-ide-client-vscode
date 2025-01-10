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
import { TDS_AGGREGATION_FUNCTION, TDS_FILTER_OPERATION, TDS_SORT_ORDER } from '../model/TDSRequest';
import { type TDSLegendExecutionResult, type TabularDataSet } from '../model/TDSLegendExecutionResult';
import { PRIMITIVE_TYPE } from './Const';
export type TDSResultCellDataType = string | number | boolean | null | undefined;
export interface TDSRowDataType {
    [key: string]: TDSResultCellDataType;
}
export declare const getTDSSortOrder: (sortOrder: string) => TDS_SORT_ORDER;
export declare const getAggregationFunction: (aggFunc: string) => TDS_AGGREGATION_FUNCTION;
export declare const getTDSFilterOperation: (filterOperation: string) => TDS_FILTER_OPERATION;
export declare const getFilterColumnType: (type: string) => PRIMITIVE_TYPE;
export declare const getAggregationTDSColumnCustomizations: (isAgGridLicenseEnabled: boolean, result: TDSLegendExecutionResult, columnName: string) => object;
export declare const getDefaultColumnDefintions: (isAgGridLicenseEnabled: boolean) => object;
export declare const getTDSRowData: (tds: TabularDataSet) => TDSRowDataType[];
//# sourceMappingURL=GridUtils.d.ts.map