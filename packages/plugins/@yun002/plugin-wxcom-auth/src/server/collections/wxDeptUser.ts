import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'WxDeptUser',
  fields: [
    { type: 'bigInt', name: 'userid', title: 'userid' },
    { type: 'string', name: 'deptid', title: 'deptid' },
    { type: 'boolean', name: 'isleader', title: 'isleader' },
    { type: 'boolean', name: 'ismain', title: 'ismain' },
  ],
});
