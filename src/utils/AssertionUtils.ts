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

import type { PlainObject } from './SerializationUtils';

export function assertNonNullable<T>(
  value: T | null | undefined,
  message = '',
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is nullable');
  }
}

export const guaranteeNonNullable = <T>(
  value: T | null | undefined,
  message = '',
): T => {
  assertNonNullable(value, message);
  return value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export type GenericClazz<T> = { new (...args: any[]): T } | Function;

// Aserts typing doesn't work with all arrow function type declaration form
// So we can use this: export const assertType: <T>(value: unknown, clazz: Clazz<T>, message: string) => asserts value is T = (value, clazz, message = '') => {
// or the normal function form
// See https://github.com/microsoft/TypeScript/issues/34523
// See https://github.com/microsoft/TypeScript/pull/33622
export function assertType<T>(
  value: unknown,
  clazz: GenericClazz<T>,
  message = '',
): asserts value is T {
  if (!(value instanceof clazz)) {
    throw new Error(
      message || `Value is expected to be of type '${clazz.name}'`,
    );
  }
}
export const guaranteeType = <T>(
  value: unknown,
  clazz: GenericClazz<T>,
  message = '',
): T => {
  assertType(value, clazz, message);
  return value;
};

export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean';

export const isObject = (val: unknown): val is object =>
  typeof val === 'object' && val !== null;

export const isPlainObject = (val: unknown): val is PlainObject =>
  isObject(val) && val.constructor.name === 'Object';
