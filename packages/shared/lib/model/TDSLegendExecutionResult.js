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
exports.TDSLegendExecutionResult = exports.TabularDataSet = exports.TDSRow = exports.TDSBuilder = exports.INTERNAL__TDSColumn = void 0;
const serializr_1 = require("serializr");
const SerializationUtils_1 = require("../utils/SerializationUtils");
class INTERNAL__TDSColumn {
    constructor() {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "relationalType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "doc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.INTERNAL__TDSColumn = INTERNAL__TDSColumn;
Object.defineProperty(INTERNAL__TDSColumn, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(INTERNAL__TDSColumn, {
        name: (0, serializr_1.primitive)(),
        type: (0, serializr_1.optional)((0, serializr_1.primitive)()),
        doc: (0, serializr_1.optional)((0, serializr_1.primitive)()),
        relationalType: (0, serializr_1.optional)((0, serializr_1.primitive)()),
    }))
});
class TDSBuilder {
    constructor() {
        Object.defineProperty(this, "columns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
exports.TDSBuilder = TDSBuilder;
Object.defineProperty(TDSBuilder, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TDSBuilder, {
        columns: (0, serializr_1.list)((0, SerializationUtils_1.usingModelSchema)(INTERNAL__TDSColumn.serialization.schema)),
    }))
});
class TDSRow {
    constructor() {
        Object.defineProperty(this, "values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
exports.TDSRow = TDSRow;
Object.defineProperty(TDSRow, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TDSRow, {
        values: (0, serializr_1.list)((0, serializr_1.primitive)()),
    }))
});
class TabularDataSet {
    constructor() {
        Object.defineProperty(this, "columns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "rows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
}
exports.TabularDataSet = TabularDataSet;
Object.defineProperty(TabularDataSet, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TabularDataSet, {
        columns: (0, serializr_1.list)((0, serializr_1.primitive)()),
        rows: (0, serializr_1.list)((0, SerializationUtils_1.usingModelSchema)(TDSRow.serialization.schema)),
    }))
});
class TDSLegendExecutionResult {
    constructor() {
        Object.defineProperty(this, "result", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.TDSLegendExecutionResult = TDSLegendExecutionResult;
Object.defineProperty(TDSLegendExecutionResult, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TDSLegendExecutionResult, {
        result: (0, SerializationUtils_1.usingModelSchema)(TabularDataSet.serialization.schema),
        builder: (0, SerializationUtils_1.usingModelSchema)(TDSBuilder.serialization.schema),
    }))
});
//# sourceMappingURL=TDSLegendExecutionResult.js.map