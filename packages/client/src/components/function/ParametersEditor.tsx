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

import '../../../../style/index.scss';
import {
  InstanceValueEditor,
  getDefaultValueForPrimitiveType,
} from './InstanceValueEditor';
import {
  guaranteeNonNullable,
  serializeMap,
} from '@finos/legend-vscode-extension-dependencies';
import { LEGEND_EXECUTE_COMMAND } from '@finos/legend-engine-ide-client-vscode-shared';
import { type InputParamter } from '../../model/InputParameter';
import { postMessage } from '../../utils/VsCodeUtils';

export const ParametersEditor: React.FC<{
  inputParameters: InputParamter[];
  isDarkTheme: boolean;
  setLoading?: (val: boolean) => void;
}> = ({ inputParameters, isDarkTheme, setLoading }) => {
  const parameterValues = new Map<string, unknown>();
  inputParameters.forEach((parameter) =>
    parameterValues.set(
      parameter.variable.name,
      getDefaultValueForPrimitiveType(
        parameter.variable._class,
        parameter.variable.multiplicity,
        parameter.element,
      ),
    ),
  );
  const submit = (): void => {
    setLoading?.(true);
    postMessage({
      command: LEGEND_EXECUTE_COMMAND,
      parameterValues: serializeMap(parameterValues, (val: unknown) => val),
    });
  };
  return (
    <div className="parameters__editor">
      <div className="parameters__editor__title">Set Parameter Values</div>
      {Array.from(parameterValues.entries()).map(([key, value], idx) => (
        <div className="parameters__editor__parameter" key={key}>
          <div className="parameters__editor__parameter__title">
            <div className="parameters__editor__parameter__name">{key}</div>
            <div className="parameters__editor__parameter__label">
              {guaranteeNonNullable(inputParameters[idx]).variable._class}
            </div>
          </div>
          <InstanceValueEditor
            isDarkTheme={isDarkTheme}
            type={guaranteeNonNullable(inputParameters[idx]).variable._class}
            multiplicity={
              guaranteeNonNullable(inputParameters[idx]).variable.multiplicity
            }
            value={value}
            onChange={(val: unknown) => {
              parameterValues.set(key, val);
            }}
            element={inputParameters[idx]?.element}
          />
        </div>
      ))}
      <div className="parameters__editor__actions">
        <button
          className="parameters__editor__submit-btn"
          title="Execute"
          onClick={submit}
        >
          Execute
        </button>
      </div>
    </div>
  );
};
