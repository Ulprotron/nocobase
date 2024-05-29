/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { getUserByCode } from './actions/index';

export class WxcomAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({
      ...config,
      userCollection: ctx.db.getCollection('users'),
    });
  }

  async validate() {
    const ctx = this.ctx;
    const {
      values: { code },
    } = ctx.action.params;
    console.log('=== auth_code ===', code);

    const appUser = await getUserByCode(ctx, code);
    if (appUser == null) throw new Error('未在系统内注册，请联系企业IT管理员同步企业微信账号');
    return appUser;
  }
}
