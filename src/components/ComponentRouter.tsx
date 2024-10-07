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

import React from 'react';
import { DIAGRAM_RENDERER, SERVICE_QUERY_EDITOR } from '../utils/Const';
import { type LegendVSCodeApplicationConfigurationData } from '../application/LegendVSCodeApplicationConfig';
import {
  type PlainObject,
  guaranteeNonEmptyString,
  guaranteeNonNullable,
} from '@finos/legend-vscode-extension-dependencies';
import { LegendVSCodeApplication } from '../application/LegendVSCodeApplication';
import { ServiceQueryEditor } from './query/ServiceQueryEditor';
import { DiagramEditor } from './diagram/DiagramEditor';
import { DiagramEditorState } from '../stores/DiagramEditorState';

export const ComponentRouter = (props: PlainObject): React.ReactNode => {
  const webviewType = guaranteeNonEmptyString(
    props.webviewType as string,
    'webviewType is required to render a web view',
  );

  let component: React.ReactNode = null;

  const configData: LegendVSCodeApplicationConfigurationData = {
    appName: 'legend-vs-code',
    env: 'dev',
    engineURL: guaranteeNonNullable(props.engineUrl as string),
    queryBuilderConfig: {
      TEMPORARY__disableQueryBuilderChat: true,
      TEMPORARY__enableGridEnterpriseMode: true,
      legendAIServiceURL: '',
      zipkinTraceBaseURL: '',
      disableEditViewPure: true,
    },
  };

  switch (webviewType) {
    case SERVICE_QUERY_EDITOR: {
      const serviceId = guaranteeNonNullable(props.serviceId as string);
      component = (
        <LegendVSCodeApplication configData={configData}>
          <ServiceQueryEditor serviceId={serviceId} />
        </LegendVSCodeApplication>
      );

      break;
    }
    case DIAGRAM_RENDERER: {
      const diagramId = guaranteeNonNullable(props.diagramId as string);
      component = (
        <LegendVSCodeApplication configData={configData}>
          <DiagramEditor diagramEditorState={new DiagramEditorState(diagramId)} />
        </LegendVSCodeApplication>
      );
      break;
    }
    default: {
      component = <div>Unsupported web view type: ${webviewType}</div>;

      break;
    }
  }

  return component;
};
