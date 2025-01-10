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
exports.isPlainObject = exports.isObject = exports.isBoolean = exports.guaranteeType = exports.guaranteeNonNullable = void 0;
exports.assertNonNullable = assertNonNullable;
exports.assertType = assertType;
function assertNonNullable(value, message = '') {
    if (value === null || value === undefined) {
        throw new Error(message || 'Value is nullable');
    }
}
const guaranteeNonNullable = (value, message = '') => {
    assertNonNullable(value, message);
    return value;
};
exports.guaranteeNonNullable = guaranteeNonNullable;
// Aserts typing doesn't work with all arrow function type declaration form
// So we can use this: export const assertType: <T>(value: unknown, clazz: Clazz<T>, message: string) => asserts value is T = (value, clazz, message = '') => {
// or the normal function form
// See https://github.com/microsoft/TypeScript/issues/34523
// See https://github.com/microsoft/TypeScript/pull/33622
function assertType(value, clazz, message = '') {
    if (!(value instanceof clazz)) {
        throw new Error(message || `Value is expected to be of type '${clazz.name}'`);
    }
}
const guaranteeType = (value, clazz, message = '') => {
    assertType(value, clazz, message);
    return value;
};
exports.guaranteeType = guaranteeType;
const isBoolean = (val) => typeof val === 'boolean';
exports.isBoolean = isBoolean;
const isObject = (val) => typeof val === 'object' && val !== null;
exports.isObject = isObject;
const isPlainObject = (val) => (0, exports.isObject)(val) && val.constructor.name === 'Object';
exports.isPlainObject = isPlainObject;
//# sourceMappingURL=AssertionUtils.js.map