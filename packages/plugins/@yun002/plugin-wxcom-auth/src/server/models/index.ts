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

export interface WxResponse {
  errcode: number;
  errmsg: string;
}

export interface WxDeptListResponse extends WxResponse {
  department: WxDept[];
}

export interface WxUserListResponse extends WxResponse {
  userlist: WxUser[];
}

export type WxDept = {
  id: number;
  parentid: number;
  order: number;
  name: string;
  name_en: string;
  isleaf: boolean;
  ismain: boolean;
  department_leader: string[];
};

export type WxDeptUser = {
  appDeptId: number;
  appUserId: number;
  deptid: number;
  name: string;
  isleader: boolean;
  ismain: boolean;
};

export type WxUser = {
  id: number;
  name: string;
  status: number;
  enable: number;
  isleader: number;
  main_department: number;
  userid: string;
  department: number[];
  is_leader_in_dept: number[];
  gender: number;
  avatar: string;
  qr_code: string;
  mobile: string;
  email: string;
  biz_mail: string;
  address: string;
};
