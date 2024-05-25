/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import AuthPlugin from '@nocobase/plugin-auth/client';
import { WxComSetting } from './wxcomSetting';
import { WxcomSignIn } from './signin';
import { Callback } from './callback';

export class PluginWxcomAuthClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    console.log(this.app);

    this.app.pluginSettingsManager.add('wxcom', {
      title: '企微集成',
      icon: 'WechatFilled',
      Component: WxComSetting,
      aclSnippet: 'pm.file-manager.storages',
    });

    const auth = this.app.pm.get(AuthPlugin);
    auth.registerType('企业微信', {
      components: {
        SignInButton: WxcomSignIn,
      },
    });

    this.router.add('hello', {
      path: '/wxauth-callback',
      Component: Callback,
    });

    // this.app.addComponents({})
    // this.app.addScopes({})
    // this.app.addProvider()
    // this.app.addProviders()
    // this.app.router.add()
  }
}

export default PluginWxcomAuthClient;
