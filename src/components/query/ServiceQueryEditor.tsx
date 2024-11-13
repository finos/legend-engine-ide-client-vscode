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
  CubesLoadingIndicator,
  CubesLoadingIndicatorIcon,
  QueryBuilder,
} from '@finos/legend-vscode-extension-dependencies';
import { useQueryBuilderState } from './useQueryBuilderState';

export const ServiceQueryEditor: React.FC<{
  serviceId: string;
}> = ({ serviceId }) => {
  const { queryBuilderState, isLoading, error } = useQueryBuilderState(
    serviceId,
    'service',
  );

  return (
    <>
      <CubesLoadingIndicator isLoading={isLoading}>
        <CubesLoadingIndicatorIcon />
      </CubesLoadingIndicator>
      {queryBuilderState && !isLoading && (
        <QueryBuilder queryBuilderState={queryBuilderState} />
      )}
      {!queryBuilderState && !isLoading && error && (
        <>Failed setting up QueryBuilderState&nbsp;{error}</>
      )}
    </>
  );
};
