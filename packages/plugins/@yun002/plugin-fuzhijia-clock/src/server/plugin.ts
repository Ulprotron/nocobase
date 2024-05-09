import { Plugin } from '@nocobase/server';
import { getWXConfig, getJSTicket } from '../actions/index';

export class PluginFuzhijiaClockServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'clock',
      actions: {
        wxconfig: getWXConfig,
      },
    });

    this.app.acl.allow('clock', '*', 'public');
    this.app.acl.allow('attachments', '*', 'public');
  }

  async install() {}
  async afterEnable() {}
  async afterDisable() {}
  async remove() {}
}

export default PluginFuzhijiaClockServer;
