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
  type Entity,
  type PlainObject,
  type V1_PackageableElement,
  assertTrue,
  guaranteeNonNullable,
  guaranteeType,
  resolvePackagePathAndElementName,
  V1_AppliedFunction,
  V1_ConcreteFunctionDefinition,
  V1_deserializePackageableElement,
  V1_deserializeValueSpecification,
  V1_EngineRuntime,
  V1_Mapping,
  V1_PackageableElementPtr,
  V1_PackageableRuntime,
  V1_PureSingleExecution,
  V1_RuntimePointer,
  V1_Service,
  V1_setupDatabaseSerialization,
  V1_setupEngineRuntimeSerialization,
  V1_setupLegacyRuntimeSerialization,
  V1_PureMultiExecution,
  uniq,
} from '@finos/legend-vscode-extension-dependencies';
import {
  ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
  ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  CLASSIFIER_PATH,
  GET_PROJECT_ENTITIES_RESPONSE,
  GET_PROJECT_ENTITIES,
  GET_ENTITY_TEXT_LOCATION,
  GET_ENTITY_TEXT_LOCATION_RESPONSE,
} from '../../utils/Const';
import { postAndWaitForMessage } from '../../utils/VsCodeUtils';
import { type LegendVSCodePluginManager } from '../../application/LegendVSCodePluginManager';
import { type LegendExecutionResult } from '../../results/LegendExecutionResult';
import { V1_LSPMappingModelCoverageAnalysisResult } from '../../model/engine/MappingModelCoverageAnalysisResult';
import { type TextLocation } from '../../model/TextLocation';

const isServiceWithNonPointerRuntime = (
  entity: Entity,
  pluginManager: LegendVSCodePluginManager,
): boolean => {
  if (entity.classifierPath === CLASSIFIER_PATH.SERVICE) {
    // setup serialization plugins
    V1_setupDatabaseSerialization(
      pluginManager.getPureProtocolProcessorPlugins(),
    );
    V1_setupEngineRuntimeSerialization(
      pluginManager.getPureProtocolProcessorPlugins(),
    );
    V1_setupLegacyRuntimeSerialization(
      pluginManager.getPureProtocolProcessorPlugins(),
    );
    const serviceElement = guaranteeType(
      V1_deserializePackageableElement(
        guaranteeNonNullable(entity.content),
        pluginManager.getPureProtocolProcessorPlugins(),
      ),
      V1_Service,
    );
    if (
      serviceElement.execution instanceof V1_PureSingleExecution &&
      !(serviceElement.execution.runtime instanceof V1_RuntimePointer)
    ) {
      return true;
    } else if (
      serviceElement.execution instanceof V1_PureMultiExecution &&
      serviceElement.execution.executionParameters
    ) {
      for (const executionParameter of serviceElement.execution
        .executionParameters) {
        if (!(executionParameter.runtime instanceof V1_RuntimePointer)) {
          return true;
        }
      }
    }
  }
  return false;
};

const getMappingAndRuntimePathsForEntity = (
  entity: Entity,
  pluginManager: LegendVSCodePluginManager,
): {
  mappingPaths: string[];
  runtimePaths: string[];
} => {
  const mappingPaths: string[] = [];
  const runtimePaths: string[] = [];

  switch (entity.classifierPath) {
    case CLASSIFIER_PATH.SERVICE: {
      const serviceElement = guaranteeType(
        V1_deserializePackageableElement(
          guaranteeNonNullable(entity.content),
          pluginManager.getPureProtocolProcessorPlugins(),
        ),
        V1_Service,
      );
      if (serviceElement.execution instanceof V1_PureSingleExecution) {
        mappingPaths.push(
          guaranteeNonNullable(serviceElement.execution.mapping),
        );
        if (serviceElement.execution.runtime instanceof V1_RuntimePointer) {
          runtimePaths.push(serviceElement.execution.runtime.runtime);
        }
      } else if (serviceElement.execution instanceof V1_PureMultiExecution) {
        serviceElement.execution.executionParameters?.forEach((parameter) => {
          if (parameter.mapping) {
            mappingPaths.push(parameter.mapping);
          }
          if (parameter.runtime instanceof V1_RuntimePointer) {
            runtimePaths.push(parameter.runtime.runtime);
          }
        });
      } else {
        throw new Error(
          `Unsupported service execution type: ${serviceElement.execution}`,
        );
      }
      break;
    }
    case CLASSIFIER_PATH.FUNCTION: {
      const functionElement = guaranteeType(
        V1_deserializePackageableElement(
          guaranteeNonNullable(entity.content),
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
      mappingPaths.push(
        guaranteeType(appliedFunction.parameters[1], V1_PackageableElementPtr)
          .fullPath,
      );
      runtimePaths.push(
        guaranteeType(appliedFunction.parameters[2], V1_PackageableElementPtr)
          .fullPath,
      );
      break;
    }
    default: {
      throw new Error(`Unsupported classifier path: ${entity.classifierPath}`);
    }
  }

  return { mappingPaths: uniq(mappingPaths), runtimePaths: uniq(runtimePaths) };
};

/**
 * Given an entity ID, return the minimal list of entities and dummy elements needed
 * to build a QueryBuilder graph for the entity.
 *
 * @param entityId the entity to analyze
 * @param pluginManager legend plugin manager
 * @returns list of minimal entities and dummy elements needed to build the graph
 */
export const getMinimalEntities = async (
  entityId: string,
  pluginManager: LegendVSCodePluginManager,
): Promise<{
  entities: Entity[];
  dummyElements: V1_PackageableElement[];
}> => {
  const currentEntityTextLocation = await postAndWaitForMessage<TextLocation>(
    {
      command: GET_ENTITY_TEXT_LOCATION,
      msg: { entityId },
    },
    GET_ENTITY_TEXT_LOCATION_RESPONSE,
  );
  const currentEntity = guaranteeNonNullable(
    (
      await postAndWaitForMessage<Entity[]>(
        {
          command: GET_PROJECT_ENTITIES,
          msg: {
            entityTextLocations: [currentEntityTextLocation],
          },
        },
        GET_PROJECT_ENTITIES_RESPONSE,
      )
    )[0],
    `Can't find entity with ID ${entityId}`,
  );

  if (isServiceWithNonPointerRuntime(currentEntity, pluginManager)) {
    throw new Error('Only runtime pointers are supported in services');
  }

  // Store additional entities that are needed for graph building
  // but don't get returned by the mapping model analysis
  const additionalEntities = [currentEntity];

  // Get the mapping and runtime paths for the current entity
  const { mappingPaths, runtimePaths } = getMappingAndRuntimePathsForEntity(
    currentEntity,
    pluginManager,
  );

  if (mappingPaths.length === 0) {
    throw new Error(`No mappings found for entity ${entityId}`);
  }

  // Perform mapping model coverage analysis
  const mappingAnalysisResponse = await postAndWaitForMessage<
    LegendExecutionResult[]
  >(
    {
      command: ANALYZE_MAPPING_MODEL_COVERAGE_COMMAND_ID,
      msg: { mapping: mappingPaths[0] },
    },
    ANALYZE_MAPPING_MODEL_COVERAGE_RESPONSE,
  );
  const mappingAnalysisResult =
    V1_LSPMappingModelCoverageAnalysisResult.serialization.fromJson(
      JSON.parse(guaranteeNonNullable(mappingAnalysisResponse?.[0]?.message)),
    );

  // Construct final list of minimal entities using model entities and additional entities
  const modelEntities = guaranteeNonNullable(
    mappingAnalysisResult.modelEntities,
    'Mapping analysis request returned empty model entities',
  );
  const finalEntities = modelEntities.concat(
    additionalEntities.filter(
      (additionalEntity) =>
        !modelEntities
          .map((modelEntity) => modelEntity.path)
          .includes(additionalEntity.path),
    ),
  );

  // Create dummy mappings and runtimes needed to build the graph
  const dummyElements: V1_PackageableElement[] = [];

  mappingPaths.forEach((mappingPath) => {
    const _mapping = new V1_Mapping();
    const [mappingPackagePath, mappingName] =
      resolvePackagePathAndElementName(mappingPath);
    _mapping.package = mappingPackagePath;
    _mapping.name = mappingName;
    dummyElements.push(_mapping);
  });

  runtimePaths.forEach((runtimePath) => {
    const _runtime = new V1_PackageableRuntime();
    const [runtimePackagePath, runtimeName] =
      resolvePackagePathAndElementName(runtimePath);
    _runtime.package = runtimePackagePath;
    _runtime.name = runtimeName;
    _runtime.runtimeValue = new V1_EngineRuntime();
    dummyElements.push(_runtime);
  });

  return { entities: finalEntities, dummyElements };
};
