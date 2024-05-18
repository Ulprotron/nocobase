/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, DEFAULT_PAGE, DEFAULT_PER_PAGE, Next } from '@nocobase/actions';
import axios, { AxiosRequestConfig } from 'axios';
import dingtalkSetting, { DingtalkSettingModel } from '../collections/dingtalkSetting';
import { PluginManager } from '@nocobase/server';

interface DingtalkAccessToken {
  accessToken: string;
  expiresAt: Date;
  corpId: string;
}

interface DingtalkReponse {
  request_id: string;
  errcode: number;
  errmsg: string;
}

// 部门基础信息
interface DeptBase {
  dept_id: number;
  name: string;
  parent_id: number;
  create_dept_group: boolean;
  auto_add_user: boolean;
}

interface UserInfoResponse extends DingtalkReponse {
  result: UserGetByCodeResponse;
}

interface UserGetByCodeResponse {
  userid: string;
  device_id: string;
  sys: boolean;
  sys_level: boolean;
  associated_unionid: string;
  unionid: string;
  name: string;
}

// 部门用户请求体包装对象
interface DeptUserResponse extends DingtalkReponse {
  result: DeptUserPageResult;
}

interface DeptUserPageResult {
  has_more: boolean;
  next_cursor: number;
  list: UserInfo[];
}

// 部门用户信息
interface UserInfo {
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
  dept_id_list: string;
  dept_order: number;
  hired_date: Date;
  active: boolean;
  admin: boolean;
  boss: boolean;
  leader: boolean;
  exclusive_account: boolean;
}

interface DeptBaseResponse extends DingtalkReponse {
  result: DeptBase[];
}

const getAccessToken = async (ctx: Context, corpId: string, key?: string, secret?: string) => {
  console.log('getAccessToken', corpId, key, secret);
  const cache = await ctx.cache.get<DingtalkAccessToken>(`dingtalk:accessToken:${corpId}`);

  if (cache && cache.accessToken) {
    if (Date.now() < cache.expiresAt.getTime() - 120) return cache;
  }

  if (key == undefined || secret == undefined) {
    const repo = ctx.db.getRepository('DingtalkSetting');
    const setting = await repo.findOne({
      filter: {
        id: 1,
      },
    });

    if (setting == null) {
      throw new Error('DingtalkSetting not found');
    }

    key = setting.dataValues.key;
    secret = setting.dataValues.secret;
  }

  const res = await axios.request({
    url: 'https://api.dingtalk.com/v1.0/oauth2/accessToken',
    method: 'POST',
    data: {
      appKey: key,
      appSecret: secret,
    },
  });

  console.log('accesstoken-res', res);

  const accessToken = {
    accessToken: res.data.accessToken,
    expiresAt: new Date(Date.now() + res.data.expireIn * 1000),
    corpId: corpId,
  };

  await ctx.cache.set(`dingtalk:accessToken:${corpId}`, accessToken);
  return accessToken;
};

const getCorpId = async (ctx: Context) => {
  const corpId = await ctx.cache.get<string>('dingtalk:corpId');
  if (corpId) return corpId;

  const repo = ctx.db.getRepository('DingtalkSetting');
  const model = await repo.findOne({
    filter: {
      id: 1,
    },
  });

  const setting = model.dataValues as DingtalkSettingModel;
  console.log('setting', setting);
  if (setting == null || !setting.enabled) throw Error('未配置钉钉集成');

  await ctx.cache.set('dingtalk:corpId', setting.corpId);
  return setting.corpId;
};

export const enable = async (ctx: Context, next) => {
  const values = ctx.action.params.values;
  const accessToken = await getAccessToken(ctx, values.corpId, values.key, values.secret);

  const repo = ctx.db.getRepository('DingtalkSetting');
  await repo.update({
    values: {
      corpId: values.corpId,
      key: values.key,
      secret: values.secret,
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      enabled: true,
    },
    filter: {
      id: 1,
    },
  });

  await ctx.cache.set('dingtalk:corpId', values.corpId);
  await next();
};

const SyncDepts = async (ctx: Context, depts: DeptBase[]) => {
  const deptRepo = ctx.db.getRepository('departments');
  depts.forEach(async (dept) => {
    const record = await deptRepo.findOne({
      filter: {
        id: dept.dept_id,
      },
    });

    if (record == null) {
      await deptRepo.create({
        values: {
          ...dept,
        },
      });
    } else {
      await deptRepo.update({
        values: {
          ...dept,
        },
        filter: {
          dept_id: dept.dept_id,
        },
      });
    }
  });
};

export const syncUsers = async (ctx: Context, next) => {
  const corpId = await getCorpId(ctx);
  const accessToken = await getAccessToken(ctx, corpId);
  const pm = ctx.app.pm as PluginManager;
  const departmentPlugin = pm.get('departments');

  const res = await axios.request<DeptBaseResponse>({
    url: `https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${accessToken.accessToken}`,
    method: 'POST',
  });

  if (res.data.errcode != 0) {
    throw new Error(`请求部门列表失败：${res.data.errcode} - ${res.data.errmsg}`);
  }

  const depts = [
    ...res.data.result,
    { dept_id: 1, name: '根部门', parent_id: 0, create_dept_group: false, auto_add_user: false },
  ];

  depts.forEach(async (dept) => {
    let next_cursor = 0;
    let has_more = true;

    while (has_more) {
      const res = await axios.request<DeptUserResponse>({
        url: `https://oapi.dingtalk.com/topapi/v2/user/list?access_token=${accessToken.accessToken}`,
        method: 'POST',
        data: {
          dept_id: dept.dept_id,
          cursor: next_cursor,
          size: 100,
          contain_access_limit: false,
        },
      });

      res.data.result.list.forEach(async (user) => {
        const repo = ctx.db.getRepository('DingtalkUser');
        const record = await repo.findOne({
          filter: {
            userid: user.userid,
          },
        });

        if (record == null) {
          await repo.create({
            values: {
              ...user,
              dept_id_list: JSON.stringify(user.dept_id_list),
            },
          });
        } else {
          await repo.update({
            values: {
              ...user,
              dept_id_list: JSON.stringify(user.dept_id_list),
            },
            filter: {
              userid: user.userid,
            },
          });
        }
      });

      has_more = res.data.result.has_more;
      next_cursor = res.data.result.next_cursor;
    }
  });

  await next();
};

export const getUserByCode = async (ctx: Context, auth_code: string) => {
  const corpId = await getCorpId(ctx);
  const accessToken = await getAccessToken(ctx, corpId);

  const res = await axios.request<UserInfoResponse>({
    url: `https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token=${accessToken.accessToken}`,
    method: 'POST',
    params: {
      code: auth_code,
    },
  });

  console.log('getUserByCode', res.data);
  const repo = ctx.db.getRepository('DingtalkUser');
  const record = await repo.findOne({
    filter: {
      userid: res.data.result.userid,
    },
  });

  if (record == null) return null;

  const { mobile, email } = record.dataValues;

  return {
    phone: mobile,
    email,
  };
};
