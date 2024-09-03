import {
  type FetchStructureLayoutConfig,
  QueryBuilderWorkflowState,
} from '@finos/legend-vscode-extension-dependencies';

export class QueryBuilderVSCodeWorkflowState extends QueryBuilderWorkflowState {
  get showStatusBar(): boolean {
    return false;
  }

  override getFetchStructureLayoutConfig(): FetchStructureLayoutConfig {
    return {
      label: 'fetch structure',
      showInFetchPanel: true,
    };
  }

  static INSTANCE = new QueryBuilderVSCodeWorkflowState();
}
