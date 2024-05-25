import { Plugin } from '@nocobase/client';
import { Clock } from './clock';

export class PluginFuzhijiaClockClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.router.add('fuzhijia-clock', {
      path: '/clock',
      Component: Clock,
    });

    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginFuzhijiaClockClient;
