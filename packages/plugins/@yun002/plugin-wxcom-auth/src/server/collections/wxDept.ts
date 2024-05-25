import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'WxDept',
  fields: [
    { type: 'bigInt', name: 'id', title: 'id' },
    { type: 'string', name: 'name', title: 'name' },
    { type: 'string', name: 'name_en', title: 'name_en' },
    { type: 'string', name: 'department_leader', title: 'department_leader' },
    { type: 'bigInt', name: 'parentid', title: 'parentId' },
    { type: 'bigInt', name: 'order', title: 'order' },
    { type: 'bigInt', name: 'appDeptId', title: 'appDeptId' },
  ],
});
