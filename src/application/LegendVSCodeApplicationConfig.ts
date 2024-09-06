import {
  type LegendApplicationConfigurationData,
  type LegendApplicationConfigurationInput,
  guaranteeNonEmptyString,
  LegendApplicationConfig,
} from '@finos/legend-vscode-extension-dependencies';

export interface LegendVSCodeApplicationConfigurationData
  extends LegendApplicationConfigurationData {
  engineURL: string;
}

export class LegendVSCodeApplicationConfig extends LegendApplicationConfig {
  readonly engineServerUrl: string;

  constructor(
    input: LegendApplicationConfigurationInput<LegendVSCodeApplicationConfigurationData>,
  ) {
    super(input);

    // engine
    this.engineServerUrl = LegendApplicationConfig.resolveAbsoluteUrl(
      guaranteeNonEmptyString(
        input.configData.engineURL,
        `Can't configure application: Engine server URL is missing in extension settings`,
      ),
    );
  }

  override getDefaultApplicationStorageKey(): string {
    return 'legend-vs-code';
  }
}
