/**
 * Copyright (c) 2020-present, Goldman Sachs
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
  type PlainObject,
} from '@finos/legend-vscode-extension-dependencies';
import {
  ApplicationFrameworkProvider,
  BrowserEnvironmentProvider,
} from '@finos/legend-application';
import { observer } from 'mobx-react-lite';
import { ComponentRouter } from '../components/ComponentRouter';

export const LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID = 'root';

export const getApplicationRootElement = (): Element => {
  const rootEl = document.getElementById(
    LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID,
  );
  if (!rootEl) {
    throw new Error(
      `Can't find root element with tag '${LEGEND_WEBVIEW_APPLICATION_ROOT_ELEMENT_ID}'`,
    );
  }
  return rootEl;
};

export const LegendVSCodeWebviewApplication = observer(
  (props: {
    baseUrl: string;
    componentRouterProps: PlainObject | undefined;
  }) => {
    const { baseUrl, componentRouterProps } = props;

    return (
      <BrowserEnvironmentProvider baseUrl={baseUrl}>
        <ApplicationFrameworkProvider>
          <ComponentRouter {...componentRouterProps} />
        </ApplicationFrameworkProvider>
      </BrowserEnvironmentProvider>
    );
  },
);
