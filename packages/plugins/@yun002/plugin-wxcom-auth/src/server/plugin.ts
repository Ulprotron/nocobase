/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { enable, syncDeptUser, getCorpSetting } from './actions';
import { WxcomAuth } from './wxcom-auth';
import { redirect } from './actions/redirect';

export class PluginWxcomAuthServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'WxSetting',
      actions: {
        enable: enable,
        sync: syncDeptUser,
        redirect: redirect,
      },
    });

    this.app.acl.allow('WxSetting', '*', 'public');
    this.app.acl.allow('WxUser', '*', 'public');
    this.app.acl.allow('WxDept', '*', 'public');
    this.app.acl.allow('WxDeptUser', '*', 'public');

    this.app.authManager.registerTypes('企业微信', {
      auth: WxcomAuth,
    });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginWxcomAuthServer;
