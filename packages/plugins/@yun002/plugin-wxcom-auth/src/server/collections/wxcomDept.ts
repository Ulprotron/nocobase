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
  name: 'WxcomDept',
  fields: [
    { type: 'string', name: 'deptid', title: 'Name' },
    { type: 'string', name: 'name', title: 'Name' },
    { type: 'string', name: 'name_en', title: 'En Name' },
    { type: 'string', name: 'parentid', title: 'ParentId' },
    { type: 'string', name: 'order', title: 'Order' },
  ],
});
