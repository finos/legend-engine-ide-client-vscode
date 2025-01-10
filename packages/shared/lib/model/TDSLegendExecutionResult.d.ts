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
import { SerializationFactory } from '../utils/SerializationUtils';
export declare class INTERNAL__TDSColumn {
    name: string;
    type?: string | undefined;
    relationalType?: string | undefined;
    doc?: string | undefined;
    static readonly serialization: SerializationFactory<INTERNAL__TDSColumn>;
}
export declare class TDSBuilder {
    columns: INTERNAL__TDSColumn[];
    static readonly serialization: SerializationFactory<TDSBuilder>;
}
export declare class TDSRow {
    values: (string | number | boolean | null)[];
    static readonly serialization: SerializationFactory<TDSRow>;
}
export declare class TabularDataSet {
    columns: string[];
    rows: TDSRow[];
    static readonly serialization: SerializationFactory<TabularDataSet>;
}
export declare class TDSLegendExecutionResult {
    result: TabularDataSet;
    builder: TDSBuilder;
    static readonly serialization: SerializationFactory<TDSLegendExecutionResult>;
}
//# sourceMappingURL=TDSLegendExecutionResult.d.ts.map