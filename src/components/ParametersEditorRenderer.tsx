import { createRoot } from 'react-dom/client';
import { Variable } from '../model/VariableExpression';
import { type PlainObject, deserializeMap } from '../utils/SerializationUtils';
import { ParametersEditor } from './ParametersEditor';

const rootElement = document.getElementById('root');
const inputParamtersFromHtml = rootElement
  ? rootElement.getAttribute('data-input-parameters')
  : '';

if (inputParamtersFromHtml) {
  const input = JSON.parse(inputParamtersFromHtml) as unknown[];
  const inputP = input[5] as Record<string, PlainObject<Variable>>;
  const inputParameters = deserializeMap(
    inputP,
    (json: PlainObject<Variable>): Variable =>
      Variable.serialization.fromJson(json),
  );
  createRoot(rootElement as HTMLElement).render(
    <ParametersEditor parameters={Array.from(inputParameters.values())} />,
  );
}
