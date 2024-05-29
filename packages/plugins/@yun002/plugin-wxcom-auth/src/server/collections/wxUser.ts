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
  name: 'WxUser',
  fields: [
    { type: 'string', name: 'userid', title: 'userid' },
    { type: 'string', name: 'name', title: 'name' },
    { type: 'string', name: 'department', title: 'department' },
    { type: 'string', name: 'open_userid', title: 'open_userid' },
    { type: 'integer', name: 'gender', title: 'gender' },
    { type: 'string', name: 'avatar', title: 'avatar' },
    { type: 'string', name: 'qr_code', title: 'qr_code' },
    { type: 'string', name: 'mobile', title: 'mobile' },
    { type: 'string', name: 'email', title: 'email' },
    { type: 'string', name: 'biz_mail', title: 'biz_mail' },
    { type: 'string', name: 'address', title: 'address' },
    { type: 'string', name: 'appUserId', title: 'appUserId' },
  ],
});
