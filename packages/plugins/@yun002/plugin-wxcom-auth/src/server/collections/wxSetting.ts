/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'WxSetting',
  fields: [
    { type: 'string', name: 'corpid', title: 'CorpId' },
    { type: 'string', name: 'agentid', title: 'AgentId' },
    { type: 'string', name: 'secret', title: 'Corp Secret' },
    { type: 'boolean', name: 'enabled', title: '是否启用' },
    { type: 'string', name: 'accessToken', title: '当前 AccessToken' },
    { type: 'date', name: 'expiresAt', title: '过期时间' },
  ],
});
