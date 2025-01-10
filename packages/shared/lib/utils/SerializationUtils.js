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
exports.deserializeMap = exports.serializeMap = exports.usingModelSchema = exports.SerializationFactory = void 0;
const serializr_1 = require("serializr");
class SerializationFactory {
    constructor(schema) {
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.schema = schema;
    }
    toJson(val) {
        return (0, serializr_1.serialize)(this.schema, val);
    }
    fromJson(val) {
        return (0, serializr_1.deserialize)(this.schema, val);
    }
}
exports.SerializationFactory = SerializationFactory;
const usingModelSchema = (schema) => (0, serializr_1.custom)((value) => (value === undefined ? undefined : (0, serializr_1.serialize)(schema, value)), (value) => (0, serializr_1.deserialize)(schema, value));
exports.usingModelSchema = usingModelSchema;
const serializeMap = (val, itemSerializer) => {
    const result = {};
    val.forEach((v, key) => {
        result[key] = itemSerializer(v);
    });
    return result;
};
exports.serializeMap = serializeMap;
const deserializeMap = (val, itemDeserializer) => {
    const result = new Map();
    Object.keys(val).forEach((key) => result.set(key, itemDeserializer(val[key])));
    return result;
};
exports.deserializeMap = deserializeMap;
//# sourceMappingURL=SerializationUtils.js.map