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
import { type ModelSchema, type PropSchema } from 'serializr';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
export declare class SerializationFactory<T> {
    readonly schema: ModelSchema<T>;
    constructor(schema: ModelSchema<T>);
    toJson(val: T): PlainObject<T>;
    fromJson(val: PlainObject<T>): T;
}
export declare const usingModelSchema: <T>(schema: ModelSchema<T>) => PropSchema;
export declare const serializeMap: <T>(val: Map<string, T>, itemSerializer: (val: T) => T extends object ? PlainObject<T> : T) => PlainObject;
export declare const deserializeMap: <T>(val: Record<string, T extends object ? PlainObject<T> : T>, itemDeserializer: (val: T extends object ? PlainObject<T> : T) => T) => Map<string, T>;
//# sourceMappingURL=SerializationUtils.d.ts.map