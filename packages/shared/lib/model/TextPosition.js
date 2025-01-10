"use strict";
/**
 * Copyright (c) 2024-present, Goldman Sachs
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
exports.TextPosition = void 0;
const serializr_1 = require("serializr");
const SerializationUtils_1 = require("../utils/SerializationUtils");
class TextPosition {
    constructor() {
        Object.defineProperty(this, "line", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "column", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.TextPosition = TextPosition;
Object.defineProperty(TextPosition, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TextPosition, {
        line: (0, serializr_1.primitive)(),
        column: (0, serializr_1.primitive)(),
    }))
});
//# sourceMappingURL=TextPosition.js.map