/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { DingtalkSetting } from './dingTalkSetting';
import AuthPlugin from '@nocobase/plugin-auth/client';
import { authType } from '../constants';
import { DingtalkSignin } from './signin';

export class PluginDingtalkAuthClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);

    this.app.pluginSettingsManager.add('yun002', {
      title: '钉钉集成',
      icon: 'FileOutlined',
      Component: DingtalkSetting,
      aclSnippet: 'pm.file-manager.storages',
    });

    const auth = this.app.pm.get(AuthPlugin);
    auth.registerType(authType, {
      components: {
        SignInButton: DingtalkSignin,
      },
    });

    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginDingtalkAuthClient;
