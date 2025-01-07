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
import {
  CLASSIFIER_PATH,
  DATACUBE,
  DIAGRAM_RENDERER,
  FUNCTION_QUERY_EDITOR,
  SERVICE_QUERY_EDITOR,
} from '../utils/Const';
import {
  type DataCubeQuery,
  type PlainObject,
  type V1_RawLambda,
  guaranteeNonEmptyString,
  guaranteeNonNullable,
} from '@finos/legend-vscode-extension-dependencies';
import { LegendVSCodeApplication } from '../application/LegendVSCodeApplication';
import { WebviewQueryBuilder } from './query/WebviewQueryBuilder';
import { DiagramEditor } from './diagram/DiagramEditor';
import { DiagramEditorState } from '../stores/DiagramEditorState';
import { type LegendVSCodeApplicationConfigurationData } from '../application/LegendVSCodeApplicationConfig';
import { postAndWaitForMessage } from '../utils/VsCodeUtils';
import { DataCubeRenderer } from './dataCube/DataCubeRenderer';

export const ComponentRouter = (props: PlainObject): React.ReactNode => {
  const webviewType = guaranteeNonEmptyString(
    props.webviewType as string,
    'webviewType is required to render a web view',
  );

  let component: React.ReactNode = null;

  const configData: LegendVSCodeApplicationConfigurationData = {
    appName: 'legend-vs-code',
    env: 'dev',
    extensions: {
      core: {
        queryBuilderConfig: {
          TEMPORARY__enableExportToCube: true,
        },
      },
    },
  };

  switch (webviewType) {
    case SERVICE_QUERY_EDITOR: {
      const entityId = guaranteeNonNullable(props.entityId as string);
      component = (
        <LegendVSCodeApplication configData={configData}>
          <WebviewQueryBuilder
            entityId={entityId}
            classifierPath={CLASSIFIER_PATH.SERVICE}
          />
        </LegendVSCodeApplication>
      );
      break;
    }
    case FUNCTION_QUERY_EDITOR: {
      const entityId = guaranteeNonNullable(props.entityId as string);
      component = (
        <LegendVSCodeApplication configData={configData}>
          <WebviewQueryBuilder
            entityId={entityId}
            classifierPath={CLASSIFIER_PATH.FUNCTION}
          />
        </LegendVSCodeApplication>
      );
      break;
    }
    case DIAGRAM_RENDERER: {
      const diagramId = guaranteeNonNullable(props.diagramId as string);
      component = (
        <LegendVSCodeApplication configData={configData}>
          <DiagramEditor
            diagramEditorState={new DiagramEditorState(diagramId)}
          />
        </LegendVSCodeApplication>
      );
      break;
    }
    case DATACUBE: {
      const cellUri = guaranteeNonNullable(props.cellUri as string);
      const lambda = guaranteeNonNullable(
        props.lambda as PlainObject<V1_RawLambda>,
      );
      const query = props.query
        ? (props.query as PlainObject<DataCubeQuery>)
        : undefined;
      component = (
        <DataCubeRenderer
          cellUri={cellUri}
          lambda={lambda}
          postAndWaitForMessage={postAndWaitForMessage}
          initialQuery={query}
        />
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
