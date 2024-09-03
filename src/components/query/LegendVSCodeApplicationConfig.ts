import { LegendApplicationConfig } from '@finos/legend-vscode-extension-dependencies';

export class LegendVSCodeApplicationConfig extends LegendApplicationConfig {
  readonly engineServerUrl = 'http://localhost:6300/api';

  override getDefaultApplicationStorageKey(): string {
    return 'legend-vs-code';
  }
}
