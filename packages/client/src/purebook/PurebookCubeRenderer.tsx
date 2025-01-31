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
  BoxArrowUpRightIcon,
  uuid,
} from '@finos/legend-vscode-extension-dependencies';
import {
  type V1_RawLambda,
} from '@finos/legend-graph/cjs';
import { OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID } from '@finos/legend-engine-ide-client-vscode-shared';
import { DataCubeRenderer } from '../components/dataCube/DataCubeRenderer';
import { type VSCodeEvent } from 'vscode-notebook-renderer/events';
import { useCallback } from 'react';

export const PurebookCubeRenderer = (props: {
  cellUri: string;
  lambda: PlainObject<V1_RawLambda>;
  postMessage: (message: unknown) => void;
  onDidReceiveMessage: VSCodeEvent<{
    command: string;
    messageId: string;
    result: unknown;
  }>;
}): React.ReactNode => {
  const { cellUri, lambda, postMessage, onDidReceiveMessage } = props;

  const postAndWaitForMessage = useCallback(
    async <T,>(
      requestMessage: { command: string; msg?: PlainObject },
      responseCommandId: string,
    ): Promise<T> => {
      const messageId = uuid();
      postMessage!({
        command: requestMessage.command,
        msg: requestMessage.msg,
        cellUri,
        messageId,
      });
      return new Promise((resolve) => {
        onDidReceiveMessage!((message) => {
          if (
            message.command === responseCommandId &&
            message.messageId === messageId
          ) {
            resolve(message.result as T);
          }
        });
      });
    },
    [cellUri, onDidReceiveMessage, postMessage],
  );

  const handleOpenInNewTab = async (): Promise<void> => {
    postMessage({
      command: OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID,
      cellUri,
      lambda,
    });
  };

  const innerHeaderRenderer = (): React.ReactNode => (
    <button title="Open in New Tab" onClick={async () => handleOpenInNewTab()}>
      <BoxArrowUpRightIcon />
    </button>
  );

  return (
    <>
      <div
        id={`purebook-datacube-renderer-${cellUri}`}
        className="purebook-datacube-renderer-container"
        style={{ height: '500px' }}
      >
        <DataCubeRenderer
          cellUri={cellUri}
          lambda={lambda}
          postAndWaitForMessage={postAndWaitForMessage}
          options={{ innerHeaderRenderer }}
        />
      </div>
    </>
  );
};
