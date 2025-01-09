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

import packageJson from '../../../package.json';
import {
  type QueryBuilderHeaderActionConfiguration,
  type QueryBuilderState,
  type V1_ConcreteFunctionDefinition,
  type V1_Service,
  assertErrorThrown,
  assertTrue,
  Button,
  FunctionQueryBuilderState,
  getFunctionNameWithPath,
  getFunctionSignature,
  graph_renameElement,
  guaranteeType,
  pureExecution_setFunction,
  PureExecution,
  RawVariableExpression,
  SaveCurrIcon,
  ServiceQueryBuilderState,
  V1_PureGraphManager,
  V1_serializePackageableElement,
} from '@finos/legend-vscode-extension-dependencies';
import { LegendVSCodeApplicationPlugin } from './LegendVSCodeApplicationPlugin';
import { WRITE_ENTITY } from '../../extension/utils/Const';
import { postMessage } from '../../extension/utils/VsCodeUtils';

export class Core_LegendVSCodeApplicationPlugin extends LegendVSCodeApplicationPlugin {
  static NAME = packageJson.extensions.applicationVSCodePlugin;

  constructor() {
    super(Core_LegendVSCodeApplicationPlugin.NAME, packageJson.version);
  }

  getExtraQueryBuilderHeaderActionConfigurations?(): QueryBuilderHeaderActionConfiguration[] {
    return [
      {
        key: 'save-query',
        category: 0,
        renderer: (queryBuilderState: QueryBuilderState): React.ReactNode => {
          const handleSaveQuery =
            queryBuilderState.applicationStore.guardUnhandledError(async () => {
              try {
                if (queryBuilderState instanceof ServiceQueryBuilderState) {
                  const graphManager = guaranteeType(
                    queryBuilderState.graphManagerState.graphManager,
                    V1_PureGraphManager,
                    'Graph manager must be a V1_PureGraphManager',
                  );
                  const rawLambda = queryBuilderState.buildQuery();
                  const service =
                    queryBuilderState.graphManagerState.graph.getService(
                      queryBuilderState.service.path,
                    );
                  const serviceExecution = guaranteeType(
                    service.execution,
                    PureExecution,
                  );
                  pureExecution_setFunction(serviceExecution, rawLambda);
                  const serviceProtocol =
                    graphManager.elementToProtocol<V1_Service>(
                      queryBuilderState.graphManagerState.graph.getElement(
                        queryBuilderState.service.path,
                      ),
                      { keepSourceInformation: false },
                    );
                  postMessage({
                    command: WRITE_ENTITY,
                    entityPath: service.path,
                    msg: V1_serializePackageableElement(
                      serviceProtocol,
                      queryBuilderState.graphManagerState.pluginManager.getPureProtocolProcessorPlugins(),
                    ),
                  });
                  queryBuilderState.applicationStore.notificationService.notifySuccess(
                    `Service query is updated`,
                  );
                } else if (
                  queryBuilderState instanceof FunctionQueryBuilderState
                ) {
                  // Get the existing function element
                  const graphManager = guaranteeType(
                    queryBuilderState.graphManagerState.graphManager,
                    V1_PureGraphManager,
                    'Graph manager must be a V1_PureGraphManager',
                  );
                  const functionElement =
                    queryBuilderState.graphManagerState.graph.getFunction(
                      queryBuilderState.functionElement.path,
                    );
                  const oldFunctionPath = functionElement.path;

                  // Update the function element with the new query
                  const rawLambda = queryBuilderState.buildQuery();
                  const lambdaParam = rawLambda.parameters
                    ? (rawLambda.parameters as object[])
                    : [];
                  const parameters = lambdaParam
                    .map((param) =>
                      graphManager.buildRawValueSpecification(
                        param,
                        queryBuilderState.graphManagerState.graph,
                      ),
                    )
                    .map((rawValueSpec) =>
                      guaranteeType(rawValueSpec, RawVariableExpression),
                    );
                  assertTrue(
                    Array.isArray(rawLambda.body),
                    `Query body expected to be a list of expressions`,
                  );
                  functionElement.expressionSequence =
                    rawLambda.body as object[];
                  functionElement.parameters = parameters;

                  // Rename the function element since query builder doesn't update function name when
                  // parameters change
                  const newFunctionPath = `${getFunctionNameWithPath(functionElement)}${getFunctionSignature(functionElement)}`;
                  if (functionElement.path !== newFunctionPath) {
                    graph_renameElement(
                      queryBuilderState.graphManagerState.graph,
                      functionElement,
                      newFunctionPath,
                      queryBuilderState.observerContext,
                    );
                  }

                  // Write the updated function element to the server
                  const functionProtocol =
                    graphManager.elementToProtocol<V1_ConcreteFunctionDefinition>(
                      functionElement,
                      { keepSourceInformation: false },
                    );
                  postMessage({
                    command: WRITE_ENTITY,
                    entityPath: oldFunctionPath,
                    msg: V1_serializePackageableElement(
                      functionProtocol,
                      queryBuilderState.graphManagerState.pluginManager.getPureProtocolProcessorPlugins(),
                    ),
                  });
                  queryBuilderState.applicationStore.notificationService.notifySuccess(
                    `Function query is updated`,
                  );
                }
              } catch (error) {
                assertErrorThrown(error);
                queryBuilderState.applicationStore.notificationService.notifyError(
                  `Can't save query: ${error.message}`,
                );
              }
            });

          return (
            <Button
              className="query-builder__header__advanced-dropdown"
              disabled={!queryBuilderState.canBuildQuery}
              onClick={handleSaveQuery}
              title="Save query"
            >
              <SaveCurrIcon />
              <div className="query-builder__header__advanced-dropdown__label">
                Save
              </div>
            </Button>
          );
        },
      },
    ];
  }
}
