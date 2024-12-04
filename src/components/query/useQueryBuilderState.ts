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

import { useEffect, useState } from 'react';
import { flowResult } from 'mobx';
import {
  type Entity,
  type PlainObject,
  type QueryBuilderState,
  type V1_PackageableElement,
  assertTrue,
  FunctionQueryBuilderState,
  graph_renameElement,
  guaranteeNonNullable,
  guaranteeType,
  PackageableElementExplicitReference,
  pureExecution_setFunction,
  PureExecution,
  QueryBuilderActionConfig,
  RawLambda,
  resolvePackagePathAndElementName,
  ServiceQueryBuilderState,
  useApplicationStore,
  V1_buildVariable,
  V1_ConcreteFunctionDefinition,
  V1_deserializePackageableElement,
  V1_EngineRuntime,
  V1_getGenericTypeFullPath,
  V1_GraphBuilderContextBuilder,
  V1_Mapping,
  V1_PackageableRuntime,
  V1_PureExecution,
  V1_PureGraphManager,
  V1_PureSingleExecution,
  V1_RuntimePointer,
  V1_Service,
  V1_serviceModelSchema,
  V1_AppliedFunction,
  V1_PackageableElementPtr,
  V1_deserializeValueSpecification,
} from '@finos/legend-vscode-extension-dependencies';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  CLASSIFIER_PATH,
  GET_PROJECT_ENTITIES_RESPONSE,
  GET_PROJECT_ENTITIES,
  LEGEND_REFRESH_QUERY_BUILDER,
} from '../../utils/Const';
import { postAndWaitForMessage } from '../../utils/VsCodeUtils';
import { QueryBuilderVSCodeWorkflowState } from './QueryBuilderWorkflowState';
import { type LegendVSCodeApplicationConfig } from '../../application/LegendVSCodeApplicationConfig';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';
import {
  buildGraphManagerStateFromEntities,
  buildRawLambdaFromFunction,
} from '../../utils/GraphUtils';
import { V1_LSPEngine } from '../../graph/V1_LSPEngine';
import { deserialize } from 'serializr';
import { type LegendExecutionResult } from '../../results/LegendExecutionResult';
import { V1_LSPMappingModelCoverageAnalysisResult } from '../../model/engine/MappingModelCoverageAnalysisResult';

const getMinimalEntities = async (
  currentId: string,
  classifierPath: string,
  pluginManager: LegendVSCodePluginManager,
): Promise<{
  entities: Entity[];
  dummyElements: V1_PackageableElement[];
}> => {
  const allEntities = await postAndWaitForMessage<Entity[]>(
    {
      command: GET_PROJECT_ENTITIES,
    },
    GET_PROJECT_ENTITIES_RESPONSE,
  );
  const currentEntity = guaranteeNonNullable(
    allEntities.find((entity) => entity.path === currentId),
    `Can't find entity with ID ${currentId}`,
  );
  let mappingPath: string;
  let runtimePath: string;
  switch (classifierPath) {
    case CLASSIFIER_PATH.SERVICE: {
      const serviceElement = guaranteeType(
        V1_deserializePackageableElement(
          guaranteeNonNullable(currentEntity.content),
          pluginManager.getPureProtocolProcessorPlugins(),
        ),
        V1_Service,
      );
      const serviceExection = guaranteeType(
        serviceElement.execution,
        V1_PureSingleExecution,
      );
      mappingPath = guaranteeNonNullable(serviceExection.mapping);
      runtimePath = guaranteeType(
        serviceExection.runtime,
        V1_RuntimePointer,
      ).runtime;
      break;
    }
    case CLASSIFIER_PATH.FUNCTION: {
      const functionElement = guaranteeType(
        V1_deserializePackageableElement(
          guaranteeNonNullable(currentEntity.content),
          pluginManager.getPureProtocolProcessorPlugins(),
        ),
        V1_ConcreteFunctionDefinition,
      );
      const appliedFunction = guaranteeType(
        V1_deserializeValueSpecification(
          guaranteeNonNullable(
            functionElement.body[0],
          ) as PlainObject<V1_AppliedFunction>,
          pluginManager.getPureProtocolProcessorPlugins(),
        ),
        V1_AppliedFunction,
      );
      assertTrue(
        appliedFunction.function === 'from',
        `Only functions returning TDS/graph fetch using the from() function can be edited via query builder`,
      );
      mappingPath = guaranteeType(
        appliedFunction.parameters[1],
        V1_PackageableElementPtr,
      ).fullPath;
      runtimePath = guaranteeType(
        appliedFunction.parameters[2],
        V1_PackageableElementPtr,
      ).fullPath;
      break;
    }
    default: {
      throw new Error(`Unsupported classifier path: ${classifierPath}`);
    }
  }

  const mappingAnalysisResponse = await postAndWaitForMessage<
    LegendExecutionResult[]
  >(
    {
      command: ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
      msg: { mapping: mappingPath },
    },
    ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  );
  const mappingAnalysisResult =
    V1_LSPMappingModelCoverageAnalysisResult.serialization.fromJson(
      JSON.parse(guaranteeNonNullable(mappingAnalysisResponse?.[0]?.message)),
    );
  const modelEntities = guaranteeNonNullable(
    mappingAnalysisResult.modelEntities,
    'Mapping analysis request returned empty model entities',
  );
  const finalEntities = modelEntities.find(
    (entity) => entity.path === currentEntity.path,
  )
    ? modelEntities
    : modelEntities.concat(currentEntity);

  // Create dummy mapping
  const _mapping = new V1_Mapping();
  const [mappingPackagePath, mappingName] =
    resolvePackagePathAndElementName(mappingPath);
  _mapping.package = mappingPackagePath;
  _mapping.name = mappingName;

  // Create dummy runtime
  const _runtime = new V1_PackageableRuntime();
  const [runtimePackagePath, runtimeName] =
    resolvePackagePathAndElementName(runtimePath);
  _runtime.package = runtimePackagePath;
  _runtime.name = runtimeName;
  _runtime.runtimeValue = new V1_EngineRuntime();

  return { entities: finalEntities, dummyElements: [_mapping, _runtime] };
};

export const useQueryBuilderState = (
  initialId: string,
  classifierPath: CLASSIFIER_PATH,
): {
  queryBuilderState: QueryBuilderState | null;
  isLoading: boolean;
  error: string;
} => {
  const applicationStore = useApplicationStore<
    LegendVSCodeApplicationConfig,
    LegendVSCodePluginManager
  >();
  // Because the entity ID can change without re-creating the entire webview (i.e., when saving a text document),
  // we need to keep track of the previous and current entity IDs so we can track which to use to fetch the
  // correct graph entity.
  const [previousId, setPreviousId] = useState(initialId);
  const [currentId, setCurrentId] = useState(initialId);
  const [queryBuilderState, setQueryBuilderState] =
    useState<QueryBuilderState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [dummyElements, setDummyElements] = useState<V1_PackageableElement[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const fetchAndSetMinimalEntities = async (): Promise<void> => {
      const { entities: newEntities, dummyElements: newDummyElements } =
        await getMinimalEntities(
          initialId,
          classifierPath,
          applicationStore.pluginManager,
        );
      setEntities(newEntities);
      setDummyElements(newDummyElements);
      setIsLoading(false);
    };
    fetchAndSetMinimalEntities();
  }, [initialId, classifierPath, applicationStore.pluginManager]);

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<{
        command: string;
        result: Entity[];
        updatedEntityId?: string;
      }>,
    ): Promise<void> => {
      const message = event.data;
      switch (message.command) {
        case LEGEND_REFRESH_QUERY_BUILDER: {
          setIsLoading(true);
          const { entities: newEntities, dummyElements: newDummyElements } =
            await getMinimalEntities(
              message.updatedEntityId ?? currentId,
              classifierPath,
              applicationStore.pluginManager,
            );
          if (message.updatedEntityId) {
            setPreviousId(currentId);
            setCurrentId(message.updatedEntityId);
          }
          setEntities(newEntities);
          setDummyElements(newDummyElements);
          setIsLoading(false);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentId, classifierPath, applicationStore.pluginManager]);

  useEffect(() => {
    const buildGraphManagerStateAndInitializeQuery =
      async (): Promise<void> => {
        const engine = new V1_LSPEngine();

        const graphManagerState = await buildGraphManagerStateFromEntities(
          entities,
          applicationStore,
          engine,
          dummyElements,
        );

        if (classifierPath === CLASSIFIER_PATH.SERVICE) {
          const serviceEntity = graphManagerState.graph.getService(currentId);
          const serviceExecution = guaranteeType(
            serviceEntity.execution,
            PureExecution,
          );
          const newQueryBuilderState = new ServiceQueryBuilderState(
            applicationStore,
            graphManagerState,
            QueryBuilderVSCodeWorkflowState.INSTANCE,
            QueryBuilderActionConfig.INSTANCE,
            serviceEntity,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              service: serviceEntity.path,
            },
          );
          newQueryBuilderState.initializeWithQuery(serviceExecution.func);
          await flowResult(
            newQueryBuilderState.explorerState.analyzeMappingModelCoverage(),
          ).catch(applicationStore.alertUnhandledError);
          setQueryBuilderState(newQueryBuilderState);
        } else if (classifierPath === CLASSIFIER_PATH.FUNCTION) {
          const functionEntity = graphManagerState.graph.getFunction(currentId);
          const newQueryBuilderState = new FunctionQueryBuilderState(
            applicationStore,
            graphManagerState,
            QueryBuilderVSCodeWorkflowState.INSTANCE,
            functionEntity,
            undefined,
          );
          newQueryBuilderState.initializeWithQuery(
            buildRawLambdaFromFunction(functionEntity, graphManagerState),
          );
          assertTrue(
            Boolean(
              newQueryBuilderState.isQuerySupported &&
                newQueryBuilderState.executionContextState.mapping &&
                newQueryBuilderState.executionContextState.runtimeValue,
            ),
            `Only functions returning TDS/graph fetch using the from() function can be edited via query builder`,
          );
          await flowResult(
            newQueryBuilderState.explorerState.analyzeMappingModelCoverage(),
          ).catch(applicationStore.alertUnhandledError);
          setQueryBuilderState(newQueryBuilderState);
        }
      };

    const updateExistingQuery = (): void => {
      const nonNullQueryBuilderState = guaranteeNonNullable(queryBuilderState);

      if (classifierPath === CLASSIFIER_PATH.SERVICE) {
        // Get updated service execution
        const V1_newExecution = guaranteeType(
          deserialize(
            V1_serviceModelSchema(
              applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
            ),
            guaranteeNonNullable(
              entities.find((entity) => entity.path === currentId)?.content,
            ),
          ).execution,
          V1_PureExecution,
        );

        // Create new lambda from updated execution
        const newFunc = new RawLambda(
          V1_newExecution.func.parameters,
          V1_newExecution.func.body,
        );

        // Get the existing service entity and execution
        const existingService = guaranteeNonNullable(
          nonNullQueryBuilderState.graphManagerState.graph.getService(
            currentId,
          ),
        );
        const existingExecution = guaranteeType(
          existingService.execution,
          PureExecution,
        );

        // Update the existing execution with the new lambda
        pureExecution_setFunction(existingExecution, newFunc);
        nonNullQueryBuilderState.initializeWithQuery(newFunc);
      } else if (classifierPath === CLASSIFIER_PATH.FUNCTION) {
        const graphManager = guaranteeType(
          nonNullQueryBuilderState.graphManagerState.graphManager,
          V1_PureGraphManager,
          'Graph manager must be a V1_PureGraphManager',
        );

        // Get updated function entity
        const V1_functionDefinition = guaranteeType(
          V1_deserializePackageableElement(
            guaranteeNonNullable(
              entities.find((entity) => entity.path === currentId)?.content,
              `Unable to find function entity with ID ${currentId}`,
            ),
            applicationStore.pluginManager.getPureProtocolProcessorPlugins(),
          ),
          V1_ConcreteFunctionDefinition,
        );

        // Get existing function entity
        let existingFunctionEntity;
        try {
          // If the function was changed from the text document, then we need to get
          // the function using its previous ID, as we haven't updated the graph yet.
          existingFunctionEntity =
            nonNullQueryBuilderState.graphManagerState.graph.getFunction(
              previousId,
            );
        } catch {
          // If the function was updated in the query builder and then saved, the graph
          // has been updated, so we can get the function using its current ID.
          existingFunctionEntity =
            nonNullQueryBuilderState.graphManagerState.graph.getFunction(
              currentId,
            );
        }

        // Update existing function element
        existingFunctionEntity.returnType =
          PackageableElementExplicitReference.create(
            nonNullQueryBuilderState.graphManagerState.graph.getType(
              V1_getGenericTypeFullPath(
                V1_functionDefinition.returnGenericType,
              ),
            ),
          );
        existingFunctionEntity.returnMultiplicity =
          V1_functionDefinition.returnMultiplicity;
        existingFunctionEntity.expressionSequence =
          V1_functionDefinition.body as object[];
        const context = new V1_GraphBuilderContextBuilder(
          nonNullQueryBuilderState.graphManagerState.graph,
          nonNullQueryBuilderState.graphManagerState.graph,
          graphManager.graphBuilderExtensions,
          graphManager.logService,
        ).build();
        existingFunctionEntity.parameters =
          V1_functionDefinition.parameters.map((e) =>
            V1_buildVariable(e, context),
          );

        // We need to update the function name if the signature has changed, and we
        // need to do it after we update the parameters so that we can set the new
        // functionName property
        if (existingFunctionEntity.path !== V1_functionDefinition.path) {
          graph_renameElement(
            nonNullQueryBuilderState.graphManagerState.graph,
            existingFunctionEntity,
            V1_functionDefinition.path,
            nonNullQueryBuilderState.observerContext,
          );
        }

        // Re-initialize query builder
        nonNullQueryBuilderState.initializeWithQuery(
          buildRawLambdaFromFunction(
            existingFunctionEntity,
            nonNullQueryBuilderState.graphManagerState,
          ),
        );
      }
    };

    if (entities.length && currentId && applicationStore) {
      try {
        if (queryBuilderState === null) {
          buildGraphManagerStateAndInitializeQuery();
        } else {
          updateExistingQuery();
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          if (queryBuilderState) {
            queryBuilderState.applicationStore.notificationService.notifyError(
              e.message,
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [
    currentId,
    previousId,
    applicationStore,
    entities,
    dummyElements,
    queryBuilderState,
    classifierPath,
  ]);

  return { queryBuilderState, isLoading, error };
};
