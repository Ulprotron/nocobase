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
  isLeaf: number;
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
  appUserId: number;
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

export const getCorpIdRequest = async (ctx: Context, next) => {
  const corpId = await getCorpId(ctx);
  ctx.body = {
    corpId,
  };
  await next();
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

const getChildDepts = async (ctx: Context, parentId: number, depts: DeptBase[]) => {
  console.log('start geting child depts of', parentId);

  const corpId = await getCorpId(ctx);
  const accessToken = await getAccessToken(ctx, corpId);

  const res = await axios.request<DeptBaseResponse>({
    url: `https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${accessToken.accessToken}`,
    method: 'POST',
    data: {
      dept_id: parentId,
    },
  });

  if (res.data.errcode != 0) {
    throw new Error(`请求部门列表失败：${res.data.errcode} - ${res.data.errmsg}`);
  }

  if (res.data.result.length == 0) return [];

  for (const dept of res.data.result) {
    depts.push(dept);
    const children = await getChildDepts(ctx, dept.dept_id, depts);
    dept.parent_id = dept.parent_id == 1 ? null : dept.parent_id;
    dept.isLeaf = children.length == 0 ? 1 : 0;
    //depts.push(...children);
  }

  return depts;
};

const syncDepts = async (ctx: Context, depts: DeptBase[]) => {
  const pm = ctx.app.pm as PluginManager;
  const departmentPlugin = pm.get('departments');
  if (departmentPlugin == null) return;

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
          id: dept.dept_id,
          title: dept.name,
          parentId: dept.parent_id,
          isLeaf: dept.isLeaf,
        },
      });
    } else {
      await deptRepo.update({
        values: {
          title: dept.name,
          parentId: dept.parent_id,
          isLeaf: dept.isLeaf,
        },
        filter: {
          id: dept.dept_id,
        },
      });
    }
  });
};

const createOrUpdateUser = async (ctx: Context, user: UserInfo) => {
  const repo = ctx.db.getRepository('DingtalkUser');
  const userRepo = ctx.db.getRepository('users');
  const deptUserRepo = ctx.db.getRepository('departmentsUsers');

  // app user
  let appUser = await userRepo.findOne({
    filter: {
      $or: [{ phone: user.mobile }, { email: user.email }],
    },
  });

  if (appUser == null) {
    appUser = await userRepo.create({
      values: {
        phone: user.mobile,
        email: user.org_email,
        nickname: user.name,
        username: user.userid,
        password: user.mobile,
      },
    });
  } else {
    await userRepo.update({
      values: {
        phone: user.mobile,
        email: user.org_email,
        nickname: user.name,
        name: user.userid,
      },
      filter: {
        id: appUser.dataValues.id,
      },
    });
  }

  // dept user
  if (user.dept_id_list) {
    const userDeptIds = user.dept_id_list.filter((deptId) => deptId != 1);
    const userDepts = userDeptIds.map((deptId) => {
      return { departmentId: deptId, userId: appUser.dataValues.id, isOwner: user.admin };
    });

    deptUserRepo.destroy({ filter: { userId: appUser.dataValues.id } });
    deptUserRepo.createMany({ records: userDepts });
  }

  // dingtalk user
  const record = await repo.findOne({
    filter: {
      userid: user.userid,
    },
  });

  if (record == null) {
    await repo.create({
      values: {
        ...user,
        appuserId: appUser.dataValues.id,
        dept_id_list: JSON.stringify(user.dept_id_list),
      },
    });
  } else {
    await repo.update({
      values: {
        ...user,
        appUserId: appUser.dataValues.id,
        dept_id_list: JSON.stringify(user.dept_id_list),
      },
      filter: {
        userid: user.userid,
      },
    });
  }
};

export const syncUsers = async (ctx: Context, next) => {
  const corpId = await getCorpId(ctx);
  const accessToken = await getAccessToken(ctx, corpId);
  const depts = new Array<DeptBase>();
  await getChildDepts(ctx, 1, depts);
  await syncDepts(ctx, depts);

  // sync
  const allDepts = [
    ...depts,
    { dept_id: 1, name: '根部门', parent_id: 0, create_dept_group: false, auto_add_user: false },
  ];

  allDepts.forEach(async (dept) => {
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

      for (const user of res.data.result.list) {
        await createOrUpdateUser(ctx, user);
      }

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
