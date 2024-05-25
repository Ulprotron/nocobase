/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { resolve } from 'path';
import { enable, syncUsers, getCorpIdRequest } from './actions/index';
import { authType } from '../constants';
import { DingtalkAuth } from './dingtalk-auth';

export class PluginDingtalkAuthServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    await this.importCollections(resolve(__dirname, 'collections'));

    this.db.addMigrations({
      namespace: 'dingtalk',
      directory: resolve(__dirname, 'migrations'),
      context: {
        plugin: this,
      },
    });

    this.app.resourceManager.define({
      name: 'DingtalkSetting',
      actions: {
        enable: enable,
        sync: syncUsers,
        getCorpId: getCorpIdRequest,
      },
    });

    this.app.acl.allow('DingtalkSetting', '*', 'public');
    this.app.acl.allow('DingtalkUser', '*', 'public');

    this.app.authManager.registerTypes(authType, {
      auth: DingtalkAuth,
    });
  }

  async install() {}

  async afterEnable() {
    const repo = this.db.getRepository('DingtalkSetting');
    const setting = await repo.findById(1);
    console.log('dingtalksetting', setting);

    if (!setting) {
      await repo.create({
        values: {
          id: 1,
          enabled: false,
        },
      });
    }
  }

  async afterDisable() {}
  async remove() {}
}

export default PluginDingtalkAuthServer;
