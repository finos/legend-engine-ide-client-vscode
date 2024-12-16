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

import { type ExtensionContext } from 'vscode';
import { type PlainObject } from '@finos/legend-vscode-extension-dependencies';
import {
  EXECUTE_QUERY_COMMAND_ID,
  EXECUTE_QUERY_RESPONSE,
  GET_CLASSIFIER_PATH_MAP_REQUEST_ID,
  GET_CLASSIFIER_PATH_MAP_RESPONSE,
  GET_CURRENT_USER_ID_REQUEST_ID,
  GET_CURRENT_USER_ID_RESPONSE,
  GET_LAMBDA_RETURN_TYPE_COMMAND_ID,
  GET_LAMBDA_RETURN_TYPE_RESPONSE,
  GET_SUBTYPE_INFO_REQUEST_ID,
  GET_SUBTYPE_INFO_RESPONSE,
  GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID,
  GRAMMAR_TO_JSON_LAMBDA_BATCH_RESPONSE,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID,
  JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
} from '../utils/Const';
import { type LegendLanguageClient } from '../LegendLanguageClient';
import { type LegendConceptTreeProvider } from '../conceptTree';

export const getCurrentUserId = (
  context: ExtensionContext,
): string | undefined => context.globalState.get('currentUserId');

/**
 * This function handles shared V1_LSPEngine messages that are common
 * across many webviews. It returns true if the message is handled and
 * false otherwise (so that the calling webview can handle it instead,
 * if needed).
 *
 * @param postMessage function to post the response message
 * @param entityTextLocation the text location of the entity used in the webview
 * @param client LegendLanguageClient instance
 * @param context extension context
 * @param legendConceptTree concept tree provider
 * @param message the message being handled
 * @returns true if the message is handled, false otherwise
 */
export const handleV1LSPEngineMessage = async (
  postMessage: (message: PlainObject) => Thenable<boolean>,
  documentUri: string,
  sectionIndex: number,
  entityid: string,
  client: LegendLanguageClient,
  context: ExtensionContext,
  legendConceptTree: LegendConceptTreeProvider,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: { command: string; msg: any },
): Promise<boolean> => {
  switch (message.command) {
    case GET_CURRENT_USER_ID_REQUEST_ID: {
      const result = getCurrentUserId(context);
      postMessage({
        command: GET_CURRENT_USER_ID_RESPONSE,
        result,
      });
      return true;
    }
    case GET_CLASSIFIER_PATH_MAP_REQUEST_ID: {
      const result = await client.getClassifierPathMap();
      postMessage({
        command: GET_CLASSIFIER_PATH_MAP_RESPONSE,
        result,
      });
      return true;
    }
    case GET_SUBTYPE_INFO_REQUEST_ID: {
      const result = await client.getSubtypeInfo();
      postMessage({
        command: GET_SUBTYPE_INFO_RESPONSE,
        result,
      });
      return true;
    }
    case EXECUTE_QUERY_COMMAND_ID: {
      const {
        lambda,
        mapping,
        runtime,
        context: executionContext,
        parameterValues,
        serializationFormat,
      } = message.msg;
      const result = await client.executeQueryByDocumentId(
        documentUri,
        sectionIndex,
        entityid,
        lambda,
        mapping,
        runtime,
        executionContext,
        parameterValues ?? {},
        serializationFormat,
      );
      postMessage({
        command: EXECUTE_QUERY_RESPONSE,
        result,
      });
      return true;
    }
    case GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID: {
      const { input } = message.msg;
      const result = await client.grammarToJson_lambda_batchByDocumentId(
        documentUri,
        sectionIndex,
        entityid,
        input,
      );
      postMessage({
        command: GRAMMAR_TO_JSON_LAMBDA_BATCH_RESPONSE,
        result,
      });
      return true;
    }
    case JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID: {
      const { lambdas, renderStyle } = message.msg;
      const result = await client.jsonToGrammar_lambda_batchByDocumentId(
        documentUri,
        sectionIndex,
        entityid,
        lambdas,
        renderStyle,
      );
      postMessage({
        command: JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE,
        result,
      });
      return true;
    }
    case GET_LAMBDA_RETURN_TYPE_COMMAND_ID: {
      const { lambda } = message.msg;
      const result = await client.getLambdaReturnTypeByDocumentId(
        documentUri,
        sectionIndex,
        entityid,
        lambda,
      );
      postMessage({
        command: GET_LAMBDA_RETURN_TYPE_RESPONSE,
        result,
      });
      return true;
    }
    default:
      return false;
  }
};
