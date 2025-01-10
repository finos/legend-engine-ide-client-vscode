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
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
export declare function assertNonNullable<T>(value: T | null | undefined, message?: string): asserts value is T;
export declare const guaranteeNonNullable: <T>(value: T | null | undefined, message?: string) => T;
type GenericClazz<T> = {
    new (...args: any[]): T;
} | Function;
export declare function assertType<T>(value: unknown, clazz: GenericClazz<T>, message?: string): asserts value is T;
export declare const guaranteeType: <T>(value: unknown, clazz: GenericClazz<T>, message?: string) => T;
export declare const isBoolean: (val: unknown) => val is boolean;
export declare const isObject: (val: unknown) => val is object;
export declare const isPlainObject: (val: unknown) => val is PlainObject;
export {};
//# sourceMappingURL=AssertionUtils.d.ts.map