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
exports.TextInterval = void 0;
const vscode_1 = require("vscode");
const serializr_1 = require("serializr");
const SerializationUtils_1 = require("../utils/SerializationUtils");
const TextPosition_1 = require("./TextPosition");
class TextInterval {
    constructor() {
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    toRange() {
        return new vscode_1.Range(new vscode_1.Position(this.start.line, this.start.column), new vscode_1.Position(this.end.line, this.end.column + 1));
    }
}
exports.TextInterval = TextInterval;
Object.defineProperty(TextInterval, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TextInterval, {
        start: (0, SerializationUtils_1.usingModelSchema)(TextPosition_1.TextPosition.serialization.schema),
        end: (0, SerializationUtils_1.usingModelSchema)(TextPosition_1.TextPosition.serialization.schema),
    }))
});
//# sourceMappingURL=TextInterval.js.map