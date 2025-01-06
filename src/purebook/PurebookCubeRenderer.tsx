/**
 * Copyright (c) 2024-present, Goldman Sachs
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
  type V1_RawLambda,
} from '@finos/legend-vscode-extension-dependencies';
import { OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID } from '../utils/Const';
import { DataCubeRenderer } from '../components/dataCube/DataCubeRenderer';

export const PurebookCubeRenderer = (props: {
  cellUri: string;
  lambda: PlainObject<V1_RawLambda>;
  postMessage: (message: unknown) => void;
  postAndWaitForMessage: <T>(
    requestMessage: { command: string; msg?: PlainObject },
    responseCommandId: string,
  ) => Promise<T>;
}): React.ReactNode => {
  const { cellUri, lambda, postMessage, postAndWaitForMessage } = props;

  const handleOpenInNewTab = (): void => {
    postMessage({
      command: OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID,
      cellUri,
      lambda,
    });
  };

  return (
    <>
      <div
        id={`purebook-cube-renderer-${cellUri}`}
        className="purebook-cube-renderer-container"
        style={{ height: '500px' }}
      >
        <button onClick={handleOpenInNewTab}>Open in New Tab</button>
        <DataCubeRenderer
          cellUri={cellUri}
          lambda={lambda}
          postAndWaitForMessage={postAndWaitForMessage}
        />
      </div>
    </>
  );
};
