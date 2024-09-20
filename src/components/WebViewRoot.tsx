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

import '@finos/legend-vscode-extension-dependencies/style/index.css';
import { createRoot } from 'react-dom/client';
import {
  guaranteeNonNullable,
  type PlainObject,
} from '@finos/legend-vscode-extension-dependencies';
import { type LegendVSCodeApplicationConfigurationData } from '../application/LegendVSCodeApplicationConfig';
import { DIAGRAM_RENDERER, SERVICE_QUERY_EDITOR } from '../utils/Const';
import { LegendVSCodeApplication } from '../application/LegendVSCodeApplication';
import { ServiceQueryEditor } from './query/ServiceQueryEditor';
import { DiagramEditor } from './diagram/DiagramEditor';
import { DiagramEditorState } from '../stores/DiagramEditorState';

export type WebViewRootDataInputParams = { webViewType: string } & PlainObject;

const rootElement = document.getElementById('root');
const inputParamtersFromHtml = rootElement
  ? rootElement.getAttribute('data-input-parameters')
  : '';
if (inputParamtersFromHtml) {
  const parsedParams = JSON.parse(
    inputParamtersFromHtml,
  ) as WebViewRootDataInputParams;
  const webViewType = guaranteeNonNullable(
    parsedParams.webViewType as string,
    'webViewType is required to render a web view',
  );

  switch (webViewType) {
    case SERVICE_QUERY_EDITOR: {
      const configData: LegendVSCodeApplicationConfigurationData = {
        appName: 'legend-vs-code',
        env: 'dev',
        engineURL: guaranteeNonNullable(parsedParams.engineUrl as string),
      };
      const serviceId = guaranteeNonNullable(parsedParams.serviceId as string);
      createRoot(rootElement as HTMLElement).render(
        <LegendVSCodeApplication configData={configData}>
          <ServiceQueryEditor serviceId={serviceId} />
        </LegendVSCodeApplication>,
      );
      break;
    }
    case DIAGRAM_RENDERER: {
      const diagramId = guaranteeNonNullable(parsedParams.diagramId as string);
      createRoot(rootElement as HTMLElement).render(
        <DiagramEditor
          diagramEditorState={new DiagramEditorState(diagramId)}
        />,
      );
      break;
    }
    default: {
      createRoot(rootElement as HTMLElement).render(
        <div>Unsupported web view type: ${webViewType}</div>,
      );
      break;
    }
  }
}
