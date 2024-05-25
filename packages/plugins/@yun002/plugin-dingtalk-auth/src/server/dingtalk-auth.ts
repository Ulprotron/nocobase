/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { Model } from '@nocobase/database';
import { getUserByCode } from './actions/index';
import { useAPIClient } from '@nocobase/client';

export class DingtalkAuth extends BaseAuth {
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

    const phoneEmail = await getUserByCode(ctx, code);
    if (phoneEmail == null) {
      throw new Error('未在系统内注册，请联系企业IT管理员同步钉钉账号');
    }
    console.log('=== phoneEmail ===', phoneEmail);
    const user = await this.userRepository.findOne({
      filter: {
        $or: [{ phone: phoneEmail.phone }, { email: phoneEmail.email }],
      },
    });

    if (!user) {
      throw new Error('异常：根据手机号或邮件查找系统内用户失败');
    }

    return user;
  }
}
