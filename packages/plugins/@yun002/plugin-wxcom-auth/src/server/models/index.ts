/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export type AccessToken = {
  access_token: string;
  expires_at: Date;
};

export type WxcomDept = {
  id: number;
  deptId: number;
  parentid: number;
  order: number;
  name: string;
  name_en: string;
  department_leader: [string];
};

export type WxcomUser = {
  userid: string;
  gender: number;
  avatar: string;
  qr_code: string;
  mobile: string;
  email: string;
  biz_mail: string;
  address: string;
};
