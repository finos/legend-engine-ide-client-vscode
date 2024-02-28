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

import { type PlainObject } from '../../utils/SerializationUtils';
import '../../../style/index.scss';
import {
  GET_TDS_REQUEST_RESULTS_ID,
  LEGEND_EXECUTE_COMMAND,
} from '../../utils/Const';
import type { InputParamter } from '../../model/InputParameter';
import { postMessage } from '../../utils/VsCodeUtils';
import { useEffect, useState } from 'react';
import {
  type TDSRowDataType,
  getAggregationTDSColumnCustomizations,
  getTDSRowData,
} from '../grid/GridUtils';
import type { ColDef } from '@ag-grid-community/core';
import {
  type INTERNAL__TDSColumn,
  TDSLegendExecutionResult,
} from '../../results/TDSLegendExecutionResult';
import { AgGridComponent } from '../grid/AgGrid';
import type { LegendExecutionResult } from '../../results/LegendExecutionResult';
import { ParametersEditor } from './ParametersEditor';

export const FunctionResultsEditor: React.FC<{
  inputParameters: InputParamter[];
  isDarkTheme: boolean;
  agGridLicense: string;
}> = ({ inputParameters, isDarkTheme, agGridLicense }) => {
  const [rowData, setRowData] = useState<TDSRowDataType[]>([]);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [columns, setColumns] = useState<INTERNAL__TDSColumn[]>([]);
  const [resultMessage, setResultMessage] = useState<string>(
    'No results to display',
  );
  const [loading, setLoading] = useState(false);

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === GET_TDS_REQUEST_RESULTS_ID) {
      const r: LegendExecutionResult = message.result[0];
      const mssg = r.message;
      try {
        const json = JSON.parse(mssg) as PlainObject<TDSLegendExecutionResult>;
        const result = TDSLegendExecutionResult.serialization.fromJson(json);
        setRowData(getTDSRowData(result.result));
        setColumns(result.builder.columns);
        setColDefs(
          result.result.columns.map((c) => ({
            field: c,
            headerName: c,
            ...getAggregationTDSColumnCustomizations(
              agGridLicense !== '',
              result,
              c,
            ),
          })),
        );
      } catch (e) {
        setResultMessage(mssg);
      }
      setLoading(false);
    }
  });

  useEffect(() => {
    if (inputParameters.length === 0) {
      setLoading(true);
      postMessage({
        command: LEGEND_EXECUTE_COMMAND,
        parameterValues: [],
      });
    }
  }, [inputParameters.length]);

  return (
    <div className="results__editor">
      {inputParameters.length !== 0 && (
        <div className="parameters__editor parameters__editor__container">
          <ParametersEditor
            isDarkTheme={isDarkTheme}
            inputParameters={inputParameters}
            setLoading={setLoading}
          />
        </div>
      )}
      <div className="results__editor__content">
        {loading && <div className="results__editor__content__loading" />}
        {rowData.length === 0 && (
          <div className="results__editor__content__message">
            {resultMessage}
          </div>
        )}
        {rowData.length > 0 && colDefs.length > 0 && (
          <div className="results__editor__content__tds">
            <AgGridComponent
              className={
                isDarkTheme ? 'ag-theme-balham-dark' : 'ag-theme-balham'
              }
              columns={columns}
              licenseKey={agGridLicense ?? ''}
              rowData={rowData}
              columnDefs={colDefs}
            />
          </div>
        )}
      </div>
    </div>
  );
};
