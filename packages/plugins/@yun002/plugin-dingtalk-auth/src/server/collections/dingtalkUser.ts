import { defineCollection } from '@nocobase/database';
export interface DingtalkUserModel {
  id: bigint;
  name: string;
  userid: string;
  unionid: string;
  avatar: string;
  state_code: string;
  mobile: string;
  telephone: string;
  job_number: string;
  title: string;
  email: string;
  remark: string;
  work_place: string;
  org_email: string;
  dept_id_list: number[];
  dept_order: number;
  hired_date: Date;
  active: boolean;
  admin: boolean;
  boss: boolean;
  leader: boolean;
  exclusive_account: boolean;
}

export default defineCollection({
  name: 'DingtalkUser',
  fields: [
    { type: 'string', name: 'name', title: '姓名' },
    { type: 'string', name: 'userid', title: '用户ID' },
    { type: 'string', name: 'unionid', title: 'UnionID' },
    { type: 'string', name: 'avatar', title: '' },
    { type: 'string', name: 'state_code', title: '' },
    { type: 'string', name: 'mobile', title: '' },
    { type: 'string', name: 'telephone', title: '' },
    { type: 'string', name: 'job_number', title: '' },
    { type: 'string', name: 'title', title: '' },
    { type: 'string', name: 'email', title: '' },
    { type: 'string', name: 'remark', title: '' },
    { type: 'string', name: 'work_place', title: '' },
    { type: 'string', name: 'org_email', title: '' },
    { type: 'string', name: 'dept_id_list', title: '' },
    { type: 'integer', name: 'dept_order', title: '' },
    { type: 'date', name: 'hired_date', title: '' },
    { type: 'boolean', name: 'active', title: '' },
    { type: 'boolean', name: 'admin', title: '' },
    { type: 'boolean', name: 'boss', title: '' },
    { type: 'boolean', name: 'leader', title: '' },
    { type: 'boolean', name: 'exclusive_account', title: '' },
  ],
});
