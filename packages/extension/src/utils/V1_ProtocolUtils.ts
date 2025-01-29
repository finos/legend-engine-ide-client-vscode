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

import {
  type V1_ConcreteFunctionDefinition,
  type V1_GenericType,
  type V1_Multiplicity,
  type V1_RawVariable,
} from '@finos/legend-graph';

const ELEMENT_PATH_DELIMITER = '::';
const FUNCTION_SIGNATURE_MULTIPLICITY_INFINITE_TOKEN = 'MANY';

const V1_getGenericTypeFullPath = (val: V1_GenericType): string => {
  if (
    Object.prototype.hasOwnProperty.call(val, 'rawType') &&
    Object.prototype.hasOwnProperty.call(val.rawType, 'fullPath')
  ) {
    return (val.rawType as unknown as { fullPath: string }).fullPath;
  }
  throw new Error('Failed to get full path from generic type');
};

const V1_buildFunctionMultiplicitySignature = (
  multiplicity: V1_Multiplicity,
): string => {
  if (multiplicity.lowerBound === multiplicity.upperBound) {
    return multiplicity.lowerBound.toString();
  } else if (
    multiplicity.lowerBound === 0 &&
    multiplicity.upperBound === undefined
  ) {
    return FUNCTION_SIGNATURE_MULTIPLICITY_INFINITE_TOKEN;
  }
  return `$${multiplicity.lowerBound}_${multiplicity.upperBound ?? FUNCTION_SIGNATURE_MULTIPLICITY_INFINITE_TOKEN}$`;
};

const V1_buildFunctionParameterSignature = (variable: V1_RawVariable): string =>
  `${variable.genericType.rawType.fullPath
    .split(ELEMENT_PATH_DELIMITER)
    .pop()}_${V1_buildFunctionMultiplicitySignature(variable.multiplicity)}_`;

const V1_buildFunctionSignatureSuffix = (
  func: V1_ConcreteFunctionDefinition,
): string =>
  `_${func.parameters
    .map((p) => V1_buildFunctionParameterSignature(p))
    .join('_')}_${V1_getGenericTypeFullPath(func.returnGenericType)
    .split(ELEMENT_PATH_DELIMITER)
    .pop()}_${V1_buildFunctionMultiplicitySignature(func.returnMultiplicity)}_`;

export const V1_getFunctionNameWithoutSignature = (
  func: V1_ConcreteFunctionDefinition,
  includePackage: boolean = true,
): string => {
  const signatureSuffix = V1_buildFunctionSignatureSuffix(func);
  const nameWithoutSignature = func.name.endsWith(signatureSuffix)
    ? func.name.substring(0, func.name.length - signatureSuffix.length)
    : func.name;
  return includePackage
    ? `${func.package}${ELEMENT_PATH_DELIMITER}${nameWithoutSignature}`
    : nameWithoutSignature;
};
