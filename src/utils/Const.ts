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

export const LEGEND_LANGUAGE_ID = 'legend';

export const LEGEND_VIRTUAL_FS_SCHEME = 'legend-vfs';

// Views
export const EXECUTION_TREE_VIEW = 'executionView';
export const RESULTS_WEB_VIEW = 'resultsView';

// Vscode theme icons
export const TEST_PASS_ICON = 'check';
export const TEST_FAIL_ICON = 'error';
export const WARNING_ICON = 'warning';

// Vscode theme colors
export const TEST_PASS_COLOR = 'testing.iconPassed';
export const TEST_FAIL_COLOR = 'testing.iconFailed';
export const TEST_ERROR_COLOR = 'testing.iconErrored';

// VS Code Commands
export const SHOW_RESULTS_COMMAND_ID = 'showResults';
export const SHOW_RESULTS_COMMAND_TITLE = 'Results';
export const SET_CONTEXT_COMMAND_ID = 'setContext';
export const LEGEND_COMMAND = 'legend.command';
export const LEGEND_EXECUTE_COMMAND = 'legend.executeCommand';
export const LEGEND_CLIENT_COMMAND_ID = 'legend.client.command';
export const EXEC_FUNCTION_ID = 'legend.function.execute';
export const ACTIVATE_FUNCTION_ID = 'legend.pure.activateFunction';
export const SEND_TDS_REQUEST_ID = 'sendTDSRequest';
export const GET_TDS_REQUEST_RESULTS_ID = 'getTDSRequestResultsId';
export const LEGEND_SHOW_DIAGRAM = 'legend.show.diagram';
export const LEGEND_EDIT_IN_QUERYBUILDER = 'legend.editInQueryBuilder';
export const LEGEND_REFRESH_QUERY_BUILDER = 'legend.refresh.query.builder';
export const ONE_ENTITY_PER_FILE_REQUEST_ID =
  'legend/oneEntityPerFileRefactoring';
export const ONE_ENTITY_PER_FILE_COMMAND_ID =
  'legend.refactor.oneEntityPerFile';

// LSP Commands
export const ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID =
  'legend.mapping.analyzeMappingModelCoverage';
export const EXECUTE_QUERY_COMMAND_ID = 'legend.query.execute';
export const GENERATE_EXECUTION_PLAN_COMMAND_ID =
  'legend.executionPlan.generate';
export const DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID =
  'legend.executionPlan.generate.debug';
export const GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID = 'legend.grammarToJson.lambda';
export const JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID =
  'legend.jsonToGrammar.lambda.batch';
export const GET_LAMBDA_RETURN_TYPE_COMMAND_ID = 'legend.lambda.returnType';
export const SURVEY_DATASETS_COMMAND_ID = 'legend.entitlements.surveyDatasets';
export const CHECK_DATASET_ENTITLEMENTS_COMMAND_ID =
  'legend.entitlements.checkDatasetEntitlements';

// LSP Request IDs
export const GET_CURRENT_USER_ID_REQUEST_ID = 'legend/getCurrentUserId';
export const TDS_JSON_REQUEST_ID = 'legend/TDSRequest';
export const REPL_CLASSPATH_REQUEST_ID = 'legend/replClasspath';
export const TEST_CASES_REQUEST_ID = 'legend/testCases';
export const EXECUTE_TESTS_REQUEST_ID = 'legend/executeTests';
export const ENTITIES_REQUEST_ID = 'legend/entities';
export const VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID = 'legend/legendVirtualFile';
export const LEGEND_WRITE_ENTITY_REQUEST_ID = 'legend/writeEntity';
export const LEGEND_COMMAND_REQUEST_ID = 'legend/command';
export const GET_CLASSIFIER_PATH_MAP_REQUEST_ID = 'legend/getClassifierPathMap';
export const GET_SUBTYPE_INFO_REQUEST_ID = 'legend/getSubtypeInfo';

// Event Types
export const GET_PROJECT_ENTITIES = 'getProjectEntities';
export const GET_ENTITY_TEXT_LOCATIONS = 'getEntityTextLocations';
export const DIAGRAM_DROP_CLASS_ERROR = 'diagramDropClassError';
export const WRITE_ENTITY = 'writeEntity';
export const QUERY_BUILDER_CONFIG_ERROR = 'queryBuilderConfigError';
export const EXPORT_DATA_COMMAND_ID = 'legend.query.exportData';

// Response events
export const GET_PROJECT_ENTITIES_RESPONSE = `${GET_PROJECT_ENTITIES}/response`;
export const GET_ENTITY_TEXT_LOCATIONS_RESPONSE = `${GET_ENTITY_TEXT_LOCATIONS}/response`;
export const GET_CURRENT_USER_ID_RESPONSE = `${GET_CURRENT_USER_ID_REQUEST_ID}/response`;
export const GET_CLASSIFIER_PATH_MAP_RESPONSE = `${GET_CLASSIFIER_PATH_MAP_REQUEST_ID}/response`;
export const GET_SUBTYPE_INFO_RESPONSE = `${GET_SUBTYPE_INFO_REQUEST_ID}/response`;
export const ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE = `${ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID}/response`;
export const EXECUTE_QUERY_RESPONSE = `${EXECUTE_QUERY_COMMAND_ID}/response`;
export const GENERATE_EXECUTION_PLAN_RESPONSE = `${GENERATE_EXECUTION_PLAN_COMMAND_ID}/response`;
export const DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE = `${DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID}/response`;
export const GRAMMAR_TO_JSON_LAMBDA_RESPONSE = `${GRAMMAR_TO_JSON_LAMBDA_COMMAND_ID}/response`;
export const JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE = `${JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID}/response`;
export const GET_LAMBDA_RETURN_TYPE_RESPONSE = `${GET_LAMBDA_RETURN_TYPE_COMMAND_ID}/response`;
export const EXPORT_DATA_RESPONSE = `${EXPORT_DATA_COMMAND_ID}/response`;
export const SURVEY_DATASETS_RESPONSE = `${SURVEY_DATASETS_COMMAND_ID}/response`;
export const CHECK_DATASET_ENTITLEMENTS_RESPONSE = `${CHECK_DATASET_ENTITLEMENTS_COMMAND_ID}/response`;

// Context variables
export const SHOW_EXECUTION_RESULTS = 'showExecutionResults';
export const IS_EXECUTION_HAPPENNG = 'isExecutionHappening';

// Notification ids
export const PROGRESS_NOTIFICATION_ID = '$/progress';

// Ag-grid script paths
export const NODE_MODULES = 'node_modules';
export const AG_GRID_COMMUNITY = '@ag-grid-community';
export const STYLES_MODULE = 'styles';
export const AG_GRID_STYLE_PATH = 'ag-grid.css';
export const AG_GRID_BALHAM_THEME = 'ag-theme-balham.min.css';

// Webviews
export const FUNCTION_PARAMTER_VALUES_ID = 'functionParameterValues';
export const DIAGRAM_RENDERER = 'diagramRenderer';
export const SERVICE_QUERY_EDITOR = 'serviceQueryEditor';
export const FUNCTION_QUERY_EDITOR = 'functionQueryEditor';

// Classifier paths
export enum CLASSIFIER_PATH {
  SERVICE = 'meta::legend::service::metamodel::Service',
  FUNCTION = 'meta::pure::metamodel::function::ConcreteFunctionDefinition',
}

// Primitive types
export enum PRIMITIVE_TYPE {
  STRING = 'String',
  BOOLEAN = 'Boolean',
  BINARY = 'Binary',
  NUMBER = 'Number', // `Number` is the supper type of all other numeric types
  INTEGER = 'Integer',
  FLOAT = 'Float',
  DECIMAL = 'Decimal',
  DATE = 'Date', // `Date` is the supper type of all other temporal types
  STRICTDATE = 'StrictDate', // just date, without time
  DATETIME = 'DateTime',
  STRICTTIME = 'StrictTime', // NOTE: not a sub-type of Date, this is used to measure length of time, not pointing at a particular moment in time like Date
  // NOTE: `LatestDate` is a special type that is used for milestoning in store so its used in the body of function and lamdba but never should be exposed to users
  // as such, if there is a day we want to have `LatestDate` in the graph but not exposed to the users
  LATESTDATE = 'LatestDate',
  BYTE = 'Byte',
}
