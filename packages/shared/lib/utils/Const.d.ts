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
export declare const LEGEND_LANGUAGE_ID = "legend";
export declare const LEGEND_VIRTUAL_FS_SCHEME = "legend-vfs";
export declare const EXECUTION_TREE_VIEW = "executionView";
export declare const RESULTS_WEB_VIEW = "resultsView";
export declare const TEST_PASS_ICON = "check";
export declare const TEST_FAIL_ICON = "error";
export declare const WARNING_ICON = "warning";
export declare const TEST_PASS_COLOR = "testing.iconPassed";
export declare const TEST_FAIL_COLOR = "testing.iconFailed";
export declare const TEST_ERROR_COLOR = "testing.iconErrored";
export declare const SHOW_RESULTS_COMMAND_ID = "showResults";
export declare const SHOW_RESULTS_COMMAND_TITLE = "Results";
export declare const SET_CONTEXT_COMMAND_ID = "setContext";
export declare const LEGEND_COMMAND = "legend.command";
export declare const LEGEND_COMMAND_V2 = "legend.command.v2";
export declare const LEGEND_CANCEL_COMMAND = "legend.cancel.command";
export declare const LEGEND_EXECUTE_COMMAND = "legend.executeCommand";
export declare const LEGEND_CLIENT_COMMAND_ID = "legend.client.command";
export declare const EXEC_FUNCTION_ID = "legend.function.execute";
export declare const ACTIVATE_FUNCTION_ID = "legend.pure.activateFunction";
export declare const SEND_TDS_REQUEST_ID = "sendTDSRequest";
export declare const GET_TDS_REQUEST_RESULTS_ID = "getTDSRequestResultsId";
export declare const LEGEND_SHOW_DIAGRAM = "legend.show.diagram";
export declare const LEGEND_EDIT_IN_QUERYBUILDER = "legend.editInQueryBuilder";
export declare const LEGEND_REFRESH_QUERY_BUILDER = "legend.refresh.query.builder";
export declare const ONE_ENTITY_PER_FILE_REQUEST_ID = "legend/oneEntityPerFileRefactoring";
export declare const ONE_ENTITY_PER_FILE_COMMAND_ID = "legend.refactor.oneEntityPerFile";
export declare const OPEN_DATACUBE_IN_NEW_TAB_COMMAND_ID = "legend.datacube.openInNewTab";
export declare const ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID = "legend.mapping.analyzeMappingModelCoverage";
export declare const EXECUTE_QUERY_COMMAND_ID = "legend.query.execute";
export declare const GENERATE_EXECUTION_PLAN_COMMAND_ID = "legend.executionPlan.generate";
export declare const DEBUG_GENERATE_EXECUTION_PLAN_COMMAND_ID = "legend.executionPlan.generate.debug";
export declare const GRAMMAR_TO_JSON_LAMBDA_BATCH_COMMAND_ID = "legend.grammarToJson.lambda.batch";
export declare const JSON_TO_GRAMMAR_LAMBDA_BATCH_COMMAND_ID = "legend.jsonToGrammar.lambda.batch";
export declare const GET_LAMBDA_RETURN_TYPE_COMMAND_ID = "legend.lambda.returnType";
export declare const SURVEY_DATASETS_COMMAND_ID = "legend.entitlements.surveyDatasets";
export declare const CHECK_DATASET_ENTITLEMENTS_COMMAND_ID = "legend.entitlements.checkDatasetEntitlements";
export declare const GET_QUERY_TYPEAHEAD_COMMAND_ID = "legend.query.typeahead";
export declare const GET_CURRENT_USER_ID_REQUEST_ID = "legend/getCurrentUserId";
export declare const TDS_JSON_REQUEST_ID = "legend/TDSRequest";
export declare const REPL_CLASSPATH_REQUEST_ID = "legend/replClasspath";
export declare const TEST_CASES_REQUEST_ID = "legend/testCases";
export declare const EXECUTE_TESTS_REQUEST_ID = "legend/executeTests";
export declare const ENTITIES_REQUEST_ID = "legend/entities";
export declare const VIRTUAL_FILE_SYSTEM_FILE_REQUEST_ID = "legend/legendVirtualFile";
export declare const LEGEND_WRITE_ENTITY_REQUEST_ID = "legend/writeEntity";
export declare const LEGEND_COMMAND_REQUEST_ID = "legend/command";
export declare const GET_CLASSIFIER_PATH_MAP_REQUEST_ID = "legend/getClassifierPathMap";
export declare const GET_SUBTYPE_INFO_REQUEST_ID = "legend/getSubtypeInfo";
export declare const GET_PROJECT_ENTITIES = "getProjectEntities";
export declare const DIAGRAM_DROP_CLASS_ERROR = "diagramDropClassError";
export declare const WRITE_ENTITY = "writeEntity";
export declare const QUERY_BUILDER_CONFIG_ERROR = "queryBuilderConfigError";
export declare const EXPORT_DATA_COMMAND_ID = "legend.query.exportData";
export declare const GET_PROJECT_ENTITIES_RESPONSE = "getProjectEntities/response";
export declare const GET_CURRENT_USER_ID_RESPONSE = "legend/getCurrentUserId/response";
export declare const GET_CLASSIFIER_PATH_MAP_RESPONSE = "legend/getClassifierPathMap/response";
export declare const GET_SUBTYPE_INFO_RESPONSE = "legend/getSubtypeInfo/response";
export declare const ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE = "legend.mapping.analyzeMappingModelCoverage/response";
export declare const EXECUTE_QUERY_RESPONSE = "legend.query.execute/response";
export declare const GENERATE_EXECUTION_PLAN_RESPONSE = "legend.executionPlan.generate/response";
export declare const DEBUG_GENERATE_EXECUTION_PLAN_RESPONSE = "legend.executionPlan.generate.debug/response";
export declare const GRAMMAR_TO_JSON_LAMBDA_BATCH_RESPONSE = "legend.grammarToJson.lambda.batch/response";
export declare const JSON_TO_GRAMMAR_LAMBDA_BATCH_RESPONSE = "legend.jsonToGrammar.lambda.batch/response";
export declare const GET_LAMBDA_RETURN_TYPE_RESPONSE = "legend.lambda.returnType/response";
export declare const EXPORT_DATA_RESPONSE = "legend.query.exportData/response";
export declare const SURVEY_DATASETS_RESPONSE = "legend.entitlements.surveyDatasets/response";
export declare const CHECK_DATASET_ENTITLEMENTS_RESPONSE = "legend.entitlements.checkDatasetEntitlements/response";
export declare const GET_QUERY_TYPEAHEAD_RESPONSE = "legend.query.typeahead/response";
export declare const SHOW_EXECUTION_RESULTS = "showExecutionResults";
export declare const IS_EXECUTION_HAPPENNG = "isExecutionHappening";
export declare const PROGRESS_NOTIFICATION_ID = "$/progress";
export declare const NODE_MODULES = "node_modules";
export declare const AG_GRID_COMMUNITY = "ag-grid-community";
export declare const STYLES_MODULE = "styles";
export declare const AG_GRID_STYLE_PATH = "ag-grid.css";
export declare const AG_GRID_BALHAM_THEME = "ag-theme-balham.min.css";
export declare const FUNCTION_PARAMTER_VALUES_ID = "functionParameterValues";
export declare const DIAGRAM_RENDERER = "diagramRenderer";
export declare const SERVICE_QUERY_EDITOR = "serviceQueryEditor";
export declare const FUNCTION_QUERY_EDITOR = "functionQueryEditor";
export declare const DATACUBE = "datacube";
export declare enum CLASSIFIER_PATH {
    SERVICE = "meta::legend::service::metamodel::Service",
    FUNCTION = "meta::pure::metamodel::function::ConcreteFunctionDefinition"
}
export declare enum PRIMITIVE_TYPE {
    STRING = "String",
    BOOLEAN = "Boolean",
    BINARY = "Binary",
    NUMBER = "Number",// `Number` is the supper type of all other numeric types
    INTEGER = "Integer",
    FLOAT = "Float",
    DECIMAL = "Decimal",
    DATE = "Date",// `Date` is the supper type of all other temporal types
    STRICTDATE = "StrictDate",// just date, without time
    DATETIME = "DateTime",
    STRICTTIME = "StrictTime",// NOTE: not a sub-type of Date, this is used to measure length of time, not pointing at a particular moment in time like Date
    LATESTDATE = "LatestDate",
    BYTE = "Byte"
}
//# sourceMappingURL=Const.d.ts.map