import {
  type AbstractPlugin,
  type AbstractPreset,
  assertErrorThrown,
  type PlainObject,
} from '@finos/legend-vscode-extension-dependencies';
import { QUERY_BUILDER_CONFIG_ERROR } from '../utils/Const';
import { LegendVSCode } from './LegendVSCode';

export class LegendVSCodeBootstrap {
  static getPresetCollection(): AbstractPreset[] {
    return [];
  }

  static getPluginCollection(): AbstractPlugin[] {
    return [];
  }

  static run(
    baseUrl: string,
    engineUrl: string,
    componentRouterProps: PlainObject,
  ): void {
    LegendVSCode.create()
      .withEngineUrl(engineUrl)
      .withComponentRouterProps(componentRouterProps)
      .setup({ baseAddress: baseUrl })
      .withPresets(LegendVSCodeBootstrap.getPresetCollection())
      .withPlugins(LegendVSCodeBootstrap.getPluginCollection())
      .start()
      .catch((e: unknown) => {
        assertErrorThrown(e);
        postMessage({ command: QUERY_BUILDER_CONFIG_ERROR, msg: e.message });
      });
  }
}
