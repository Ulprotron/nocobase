import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';
import File2Base64Instruction from './File2Base64Instruction';

export class PluginWorkflowFile2base64Server extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const workflowPlugin = this.app.pm.get('workflow') as WorkflowPlugin;
    workflowPlugin.registerInstruction('file2base64', File2Base64Instruction);
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginWorkflowFile2base64Server;
