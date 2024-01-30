import { createRoot } from 'react-dom/client';
import { type PlainObject, deserializeMap } from '../utils/SerializationUtils';
import { ParametersEditor } from './ParametersEditor';
import { InputParamter } from '../model/InputParameter';

const rootElement = document.getElementById('root');
const inputParamtersFromHtml = rootElement
  ? rootElement.getAttribute('data-input-parameters')
  : '';
const isDarkTheme = rootElement
  ? rootElement.getAttribute('data-is-dark-theme')
  : 'false';

if (inputParamtersFromHtml) {
  const input = JSON.parse(inputParamtersFromHtml) as unknown[];
  const inputP = input[5] as Record<string, PlainObject<InputParamter>>;
  const inputParameters = deserializeMap(
    inputP,
    (json: PlainObject<InputParamter>): InputParamter =>
      InputParamter.serialization.fromJson(json),
  );
  createRoot(rootElement as HTMLElement).render(
    <ParametersEditor
      isDarkTheme={isDarkTheme === 'true' ? true : false}
      inputParameters={Array.from(inputParameters.values())}
    />,
  );
}
