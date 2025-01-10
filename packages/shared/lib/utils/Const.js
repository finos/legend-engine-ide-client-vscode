"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_PROJECT_ENTITIES = exports.GET_SUBTYPE_INFO_REQUEST_ID = exports.GET_CLASSIFIER_PATH_MAP_REQUEST_ID = exports.LEGEND_COMMAND_REQUEST_ID = exports.LEGEND_WRITE_ENTITY_REQUEST_ID = exports.VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID = exports.ENTITIES_REQUEST_ID = exports.EXECUTE_TESTS_REQUEST_ID = exports.TEST_CASES_REQUEST_ID = exports.REPL_CLASSPATH_REQUEST_ID = exports.TDS_JSON_REQUEST_ID = exports.GET_CURRENT_USER_ID_REQUEST_ID = exports.GET_QUERY_TYPEAHEAD_COMMAND_ID = exports.CHECK_DATASET_ENTITLEMENTS_COMMAND_ID = exports.SURVEY_DATASETS_COMMAND_ID = exports.GET_LAMBDA_RETURN_TYPE_COMMAND_ID = exports.JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID = exports.GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID = exports.DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID = exports.GENERATE_EXECUTION_PLAN_COMMAND_ID = exports.EXECUTE_QUERY_COMMAND_ID = exports.ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID = exports.OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID = exports.ONE_ENTITY_PER_FILE_COMMAND_ID = exports.ONE_ENTITY_PER_FILE_REQUEST_ID = exports.LEGEND_REFRESH_QUERY_BUILDER = exports.LEGEND_EDIT_IN_QUERYBUILDER = exports.LEGEND_SHOW_DIAGRAM = exports.GET_TDS_REQUEST_RESULTS_ID = exports.SEND_TDS_REQUEST_ID = exports.ACTIVATE_FUNCTION_ID = exports.EXEC_FUNCTION_ID = exports.LEGEND_CLIENT_COMMAND_ID = exports.LEGEND_EXECUTE_COMMAND = exports.LEGEND_CANCEL_COMMAND = exports.LEGEND_COMMAND_V2 = exports.LEGEND_COMMAND = exports.SET_CONTEXT_COMMAND_ID = exports.SHOW_RESULTS_COMMAND_TITLE = exports.SHOW_RESULTS_COMMAND_ID = exports.TEST_ERROR_COLOR = exports.TEST_FAIL_COLOR = exports.TEST_PASS_COLOR = exports.WARNING_ICON = exports.TEST_FAIL_ICON = exports.TEST_PASS_ICON = exports.RESULTS_WEB_VIEW = exports.EXECUTION_TREE_VIEW = exports.LEGEND_VIRTUAL_FS_SCHEME = exports.LEGEND_LANGUAGE_ID = void 0;
exports.PRIMITIVE_TYPE = exports.CLASSIFIER_PATH = exports.DATACUBE = exports.FUNCTION_QUERY_EDITOR = exports.SERVICE_QUERY_EDITOR = exports.DIAGRAM_RENDERER = exports.FUNCTION_PARAMTER_VALUES_ID = exports.AG_GRID_BALHAM_THEME = exports.AG_GRID_STYLE_PATH = exports.STYLES_MODULE = exports.AG_GRID_COMMUNITY = exports.NODE_MODULES = exports.PROGRESS_NOTIFICATION_ID = exports.IS_EXECUTION_HAPPENNG = exports.SHOW_EXECUTION_RESULTS = exports.GET_QUERY_TYPEAHEAD_RESPONSE = exports.CHECK_DATASET_ENTITLEMENTS_RESPONSE = exports.SURVEY_DATASETS_RESPONSE = exports.EXPORT_DATA_RESPONSE = exports.GET_LAMBDA_RETURN_TYPE_RESPONSE = exports.JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE = exports.GRAMMAR_TO_JSON_LAMBDA_BATCH_RESPONSE = exports.DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE = exports.GENERATE_EXECUTION_PLAN_RESPONSE = exports.EXECUTE_QUERY_RESPONSE = exports.ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE = exports.GET_SUBTYPE_INFO_RESPONSE = exports.GET_CLASSIFIER_PATH_MAP_RESPONSE = exports.GET_CURRENT_USER_ID_RESPONSE = exports.GET_PROJECT_ENTITIES_RESPONSE = exports.EXPORT_DATA_COMMAND_ID = exports.QUERY_BUILDER_CONFIG_ERROR = exports.WRITE_ENTITY = exports.DIAGRAM_DROP_CLASS_ERROR = void 0;
exports.LEGEND_LANGUAGE_ID = 'legend';
exports.LEGEND_VIRTUAL_FS_SCHEME = 'legend-vfs';
// Views
exports.EXECUTION_TREE_VIEW = 'executionView';
exports.RESULTS_WEB_VIEW = 'resultsView';
// Vscode theme icons
exports.TEST_PASS_ICON = 'check';
exports.TEST_FAIL_ICON = 'error';
exports.WARNING_ICON = 'warning';
// Vscode theme colors
exports.TEST_PASS_COLOR = 'testing.iconPassed';
exports.TEST_FAIL_COLOR = 'testing.iconFailed';
exports.TEST_ERROR_COLOR = 'testing.iconErrored';
// VS Code Commands
exports.SHOW_RESULTS_COMMAND_ID = 'showResults';
exports.SHOW_RESULTS_COMMAND_TITLE = 'Results';
exports.SET_CONTEXT_COMMAND_ID = 'setContext';
exports.LEGEND_COMMAND = 'legend.command';
exports.LEGEND_COMMAND_V2 = 'legend.command.v2';
exports.LEGEND_CANCEL_COMMAND = 'legend.cancel.command';
exports.LEGEND_EXECUTE_COMMAND = 'legend.executeCommand';
exports.LEGEND_CLIENT_COMMAND_ID = 'legend.client.command';
exports.EXEC_FUNCTION_ID = 'legend.function.execute';
exports.ACTIVATE_FUNCTION_ID = 'legend.pure.activateFunction';
exports.SEND_TDS_REQUEST_ID = 'sendTDSRequest';
exports.GET_TDS_REQUEST_RESULTS_ID = 'getTDSRequestResultsId';
exports.LEGEND_SHOW_DIAGRAM = 'legend.show.diagram';
exports.LEGEND_EDIT_IN_QUERYBUILDER = 'legend.editInQueryBuilder';
exports.LEGEND_REFRESH_QUERY_BUILDER = 'legend.refresh.query.builder';
exports.ONE_ENTITY_PER_FILE_REQUEST_ID = 'legend/oneEntityPerFileRefactoring';
exports.ONE_ENTITY_PER_FILE_COMMAND_ID = 'legend.refactor.oneEntityPerFile';
exports.OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID = 'legend.datacube.openInNewTab';
// LSP Commands
exports.ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID = 'legend.mapping.analyzeMappingModelCoverage';
exports.EXECUTE_QUERY_COMMAND_ID = 'legend.query.execute';
exports.GENERATE_EXECUTION_PLAN_COMMAND_ID = 'legend.executionPlan.generate';
exports.DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID = 'legend.executionPlan.generate.debug';
exports.GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID = 'legend.grammarToJson.lambda.batch';
exports.JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID = 'legend.jsonToGrammar.lambda.batch';
exports.GET_LAMBDA_RETURN_TYPE_COMMAND_ID = 'legend.lambda.returnType';
exports.SURVEY_DATASETS_COMMAND_ID = 'legend.entitlements.surveyDatasets';
exports.CHECK_DATASET_ENTITLEMENTS_COMMAND_ID = 'legend.entitlements.checkDatasetEntitlements';
exports.GET_QUERY_TYPEAHEAD_COMMAND_ID = 'legend.query.typeahead';
// LSP Request IDs
exports.GET_CURRENT_USER_ID_REQUEST_ID = 'legend/getCurrentUserId';
exports.TDS_JSON_REQUEST_ID = 'legend/TDSRequest';
exports.REPL_CLASSPATH_REQUEST_ID = 'legend/replClasspath';
exports.TEST_CASES_REQUEST_ID = 'legend/testCases';
exports.EXECUTE_TESTS_REQUEST_ID = 'legend/executeTests';
exports.ENTITIES_REQUEST_ID = 'legend/entities';
exports.VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID = 'legend/legendVirtualFile';
exports.LEGEND_WRITE_ENTITY_REQUEST_ID = 'legend/writeEntity';
exports.LEGEND_COMMAND_REQUEST_ID = 'legend/command';
exports.GET_CLASSIFIER_PATH_MAP_REQUEST_ID = 'legend/getClassifierPathMap';
exports.GET_SUBTYPE_INFO_REQUEST_ID = 'legend/getSubtypeInfo';
// Event Types
exports.GET_PROJECT_ENTITIES = 'getProjectEntities';
exports.DIAGRAM_DROP_CLASS_ERROR = 'diagramDropClassError';
exports.WRITE_ENTITY = 'writeEntity';
exports.QUERY_BUILDER_CONFIG_ERROR = 'queryBuilderConfigError';
exports.EXPORT_DATA_COMMAND_ID = 'legend.query.exportData';
// Response events
exports.GET_PROJECT_ENTITIES_RESPONSE = `${exports.GET_PROJECT_ENTITIES}/response`;
exports.GET_CURRENT_USER_ID_RESPONSE = `${exports.GET_CURRENT_USER_ID_REQUEST_ID}/response`;
exports.GET_CLASSIFIER_PATH_MAP_RESPONSE = `${exports.GET_CLASSIFIER_PATH_MAP_REQUEST_ID}/response`;
exports.GET_SUBTYPE_INFO_RESPONSE = `${exports.GET_SUBTYPE_INFO_REQUEST_ID}/response`;
exports.ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE = `${exports.ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID}/response`;
exports.EXECUTE_QUERY_RESPONSE = `${exports.EXECUTE_QUERY_COMMAND_ID}/response`;
exports.GENERATE_EXECUTION_PLAN_RESPONSE = `${exports.GENERATE_EXECUTION_PLAN_COMMAND_ID}/response`;
exports.DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE = `${exports.DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID}/response`;
exports.GRAMMAR_TO_JSON_LAMBDA_BATCH_RESPONSE = `${exports.GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID}/response`;
exports.JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE = `${exports.JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID}/response`;
exports.GET_LAMBDA_RETURN_TYPE_RESPONSE = `${exports.GET_LAMBDA_RETURN_TYPE_COMMAND_ID}/response`;
exports.EXPORT_DATA_RESPONSE = `${exports.EXPORT_DATA_COMMAND_ID}/response`;
exports.SURVEY_DATASETS_RESPONSE = `${exports.SURVEY_DATASETS_COMMAND_ID}/response`;
exports.CHECK_DATASET_ENTITLEMENTS_RESPONSE = `${exports.CHECK_DATASET_ENTITLEMENTS_COMMAND_ID}/response`;
exports.GET_QUERY_TYPEAHEAD_RESPONSE = `${exports.GET_QUERY_TYPEAHEAD_COMMAND_ID}/response`;
// Context variables
exports.SHOW_EXECUTION_RESULTS = 'showExecutionResults';
exports.IS_EXECUTION_HAPPENNG = 'isExecutionHappening';
// Notification ids
exports.PROGRESS_NOTIFICATION_ID = '$/progress';
// Ag-grid script paths
exports.NODE_MODULES = 'node_modules';
exports.AG_GRID_COMMUNITY = 'ag-grid-community';
exports.STYLES_MODULE = 'styles';
exports.AG_GRID_STYLE_PATH = 'ag-grid.css';
exports.AG_GRID_BALHAM_THEME = 'ag-theme-balham.min.css';
// Webviews
exports.FUNCTION_PARAMTER_VALUES_ID = 'functionParameterValues';
exports.DIAGRAM_RENDERER = 'diagramRenderer';
exports.SERVICE_QUERY_EDITOR = 'serviceQueryEditor';
exports.FUNCTION_QUERY_EDITOR = 'functionQueryEditor';
exports.DATACUBE = 'datacube';
// Classifier paths
var CLASSIFIER_PATH;
(function (CLASSIFIER_PATH) {
    CLASSIFIER_PATH["SERVICE"] = "meta::legend::service::metamodel::Service";
    CLASSIFIER_PATH["FUNCTION"] = "meta::pure::metamodel::function::ConcreteFunctionDefinition";
})(CLASSIFIER_PATH || (exports.CLASSIFIER_PATH = CLASSIFIER_PATH = {}));
// Primitive types
var PRIMITIVE_TYPE;
(function (PRIMITIVE_TYPE) {
    PRIMITIVE_TYPE["STRING"] = "String";
    PRIMITIVE_TYPE["BOOLEAN"] = "Boolean";
    PRIMITIVE_TYPE["BINARY"] = "Binary";
    PRIMITIVE_TYPE["NUMBER"] = "Number";
    PRIMITIVE_TYPE["INTEGER"] = "Integer";
    PRIMITIVE_TYPE["FLOAT"] = "Float";
    PRIMITIVE_TYPE["DECIMAL"] = "Decimal";
    PRIMITIVE_TYPE["DATE"] = "Date";
    PRIMITIVE_TYPE["STRICTDATE"] = "StrictDate";
    PRIMITIVE_TYPE["DATETIME"] = "DateTime";
    PRIMITIVE_TYPE["STRICTTIME"] = "StrictTime";
    // NOTE: `LatestDate` is a special type that is used for milestoning in store so its used in the body of function and lamdba but never should be exposed to users
    // as such, if there is a day we want to have `LatestDate` in the graph but not exposed to the users
    PRIMITIVE_TYPE["LATESTDATE"] = "LatestDate";
    PRIMITIVE_TYPE["BYTE"] = "Byte";
})(PRIMITIVE_TYPE || (exports.PRIMITIVE_TYPE = PRIMITIVE_TYPE = {}));
//# sourceMappingURL=Const.js.map