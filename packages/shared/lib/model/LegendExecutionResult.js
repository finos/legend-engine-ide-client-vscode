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
exports.LegendExecutionResult = void 0;
const serializr_1 = require("serializr");
const SerializationUtils_1 = require("../utils/SerializationUtils");
const TextLocation_1 = require("./TextLocation");
class LegendExecutionResult {
    constructor() {
        Object.defineProperty(this, "ids", {
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
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.LegendExecutionResult = LegendExecutionResult;
Object.defineProperty(LegendExecutionResult, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(LegendExecutionResult, {
        ids: (0, serializr_1.list)((0, serializr_1.primitive)()),
        type: (0, serializr_1.primitive)(),
        message: (0, serializr_1.primitive)(),
        logMessage: (0, serializr_1.optional)((0, serializr_1.primitive)()),
        location: (0, SerializationUtils_1.usingModelSchema)(TextLocation_1.TextLocation.serialization.schema),
        messageType: (0, serializr_1.optional)((0, serializr_1.primitive)()),
    }))
});
//# sourceMappingURL=LegendExecutionResult.js.map