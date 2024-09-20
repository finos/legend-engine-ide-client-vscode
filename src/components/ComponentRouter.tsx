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

  switch (webviewType) {
    case SERVICE_QUERY_EDITOR: {
      const configData: LegendVSCodeApplicationConfigurationData = {
        appName: 'legend-vs-code',
        env: 'dev',
        engineURL: guaranteeNonNullable(props.engineUrl as string),
      };
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
        <DiagramEditor diagramEditorState={new DiagramEditorState(diagramId)} />
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
