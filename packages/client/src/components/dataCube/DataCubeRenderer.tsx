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
  type DataCubeOptions,
  type DataCubeQuery,
  type PlainObject,
  type V1_RawLambda,
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  DataCube,
} from '@finos/legend-vscode-extension-dependencies';
import { useEffect, useState } from 'react';
import { LSPDataCubeEngine } from './LSPDataCubeEngine';

export const DataCubeRenderer = (props: {
  cellUri: string;
  lambda: PlainObject<V1_RawLambda>;
  postAndWaitForMessage: <T>(
    requestMessage: { command: string; msg?: PlainObject },
    responseCommandId: string,
  ) => Promise<T>;
  options?: DataCubeOptions;
}): React.ReactNode => {
  const { cellUri, lambda, postAndWaitForMessage, options } = props;
  const [engine, setEngine] = useState<LSPDataCubeEngine | null>(null);
  const [query, setQuery] = useState<DataCubeQuery | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const newEngine = new LSPDataCubeEngine(lambda, postAndWaitForMessage);
        setEngine(newEngine);
        setQuery(await newEngine.generateInitialQuery());
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [cellUri, lambda, postAndWaitForMessage]);

  return (
    <>
      <CubesLoadingIndicator isLoading={isLoading}>
        <CubesLoadingIndicatorIcon />
      </CubesLoadingIndicator>
      {engine && query && !isLoading && (
        <div
          id={`datacube-renderer-${cellUri}`}
          className="datacube-renderer-container"
          style={{ height: '100%' }}
        >
          <DataCube engine={engine} query={query} options={options} />
        </div>
      )}
      {!engine && !query && !isLoading && error && (
        <>
          <div>
            Failed creating engine and query for Purebook Datacube renderer
          </div>
          <div>{error}</div>
        </>
      )}
    </>
  );
};
