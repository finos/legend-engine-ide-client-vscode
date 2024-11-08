import {
  type V1_ConcreteFunctionDefinition,
  type V1_Multiplicity,
  type V1_RawVariable,
} from '@finos/legend-vscode-extension-dependencies';

const ELEMENT_PATH_DELIMITER = '::';
const FUNCTION_SIGNATURE_MULTIPLICITY_INFINITE_TOKEN = 'MANY';

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
  `${variable.class
    .split(ELEMENT_PATH_DELIMITER)
    .pop()}_${V1_buildFunctionMultiplicitySignature(variable.multiplicity)}_`;

const V1_buildFunctionSignatureSuffix = (
  func: V1_ConcreteFunctionDefinition,
): string =>
  `_${func.parameters
    .map((p) => V1_buildFunctionParameterSignature(p))
    .join('_')}_${func.returnType
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
