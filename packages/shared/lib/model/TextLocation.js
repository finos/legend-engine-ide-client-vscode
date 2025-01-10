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
exports.TextLocation = void 0;
const vscode_1 = require("vscode");
const serializr_1 = require("serializr");
const SerializationUtils_1 = require("../utils/SerializationUtils");
const TextInterval_1 = require("./TextInterval");
class TextLocation {
    constructor() {
        Object.defineProperty(this, "documentId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    uri() {
        return vscode_1.Uri.parse(this.documentId);
    }
    toLocation() {
        return new vscode_1.Location(this.uri(), this.textInterval.toRange());
    }
}
exports.TextLocation = TextLocation;
Object.defineProperty(TextLocation, "serialization", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new SerializationUtils_1.SerializationFactory((0, serializr_1.createModelSchema)(TextLocation, {
        documentId: (0, serializr_1.primitive)(),
        textInterval: (0, SerializationUtils_1.usingModelSchema)(TextInterval_1.TextInterval.serialization.schema),
    }))
});
//# sourceMappingURL=TextLocation.js.map