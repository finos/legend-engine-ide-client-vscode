import {
  PrimitiveTypeEditor,
  getDefaultValueForPrimitiveType,
} from './PrimitiveTypeEditor';
import type { Variable } from '../model/VariableExpression';
import { guaranteeNonNullable } from '../utils/AssertionUtils';
import { serializeMap } from '../utils/SerializationUtils';
import '../../style/index.scss';
import { LEGEND_EXECUTE_COMMAND } from '../utils/Const';

interface vscode {
  postMessage(message: unknown): void;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare const vscode: vscode;

export const ParametersEditor: React.FC<{
  parameters: Variable[];
}> = ({ parameters }) => {
  const parameterValues = new Map<string, unknown>();
  parameters.forEach((parameter) =>
    parameterValues.set(
      parameter.name,
      getDefaultValueForPrimitiveType(parameter._class),
    ),
  );
  const submit = (): void => {
    vscode.postMessage({
      command: LEGEND_EXECUTE_COMMAND,
      parameterValues: serializeMap(parameterValues, (val: unknown) => val),
    });
  };
  return (
    <div className="parameters__editor">
      {Array.from(parameterValues.entries()).map(([key, value], idx) => (
        <div className="parameters__editor__parameter" key={key}>
          <div className="parameters__editor__parameter__name">{key}</div>
          <PrimitiveTypeEditor
            type={guaranteeNonNullable(parameters[idx])._class}
            value={value}
            onChange={(val: unknown) => {
              parameterValues.set(key, val);
            }}
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
