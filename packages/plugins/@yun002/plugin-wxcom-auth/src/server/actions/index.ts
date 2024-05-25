/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, DEFAULT_PAGE, DEFAULT_PER_PAGE, Next } from '@nocobase/actions';
import { PluginManager } from '@nocobase/server';
import axios from 'axios';
import { AccessToken, WxDept, WxUser, WxDeptListResponse, WxUserListResponse } from '../models/index';
import wxUser from '../collections/wxUser';
import { WxSync } from './wxSync';

const getAccessToken = async (ctx: Context, corpid: string = undefined, secret: string = undefined) => {
  const cache = await ctx.cache.get<AccessToken>('wxcom_access_token');

  if (cache && cache.access_token) {
    if (Date.now() < cache.expires_at.getTime() - 120) return cache;
  }

  if (corpid == undefined || secret == undefined) {
    const repo = ctx.db.getRepository('WxSetting');
    const setting = await repo.findOne({
      filter: {
        id: 1,
      },
    });

    if (setting == null) {
      throw new Error('未配置企微集成');
    }

    corpid = setting.dataValues.corpid;
    secret = setting.dataValues.secret;
  }

  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`;
  const res = await axios.get(url);
  const data = res.data;
  if (data.errcode != 0) throw Error(data.errmsg);

  const token = {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
  };

  await ctx.cache.set('wxcom_access_token', token);
  return token;
};

const getDepts = async (ctx: Context, accessToken: string) => {
  const res = await axios.request<WxDeptListResponse>({
    url: 'https://qyapi.weixin.qq.com/cgi-bin/department/list',
    method: 'GET',
    params: {
      access_token: accessToken,
    },
  });

  return res.data.department;
};

export const getCorpSetting = async (ctx: Context) => {
  const setting = await ctx.db.getRepository('WxSetting').findOne({ filter: { id: 1 } });
  if (setting == null) {
    throw new Error('未配置企微集成');
  }

  return setting;
};

export const getUserByCode = async (ctx: Context, code: string) => {
  const access_token = await getAccessToken(ctx);
  const { UserId, user_ticket } = await WxSync.getUserIdByCode(access_token.access_token, code);

  const wxUserRepo = ctx.db.getRepository('WxUser');
  const appUserRepo = ctx.db.getRepository('users');

  // 用户之前已经通过企微登录，且获取了手机号邮箱；
  const wxUser = await wxUserRepo.findOne({ filter: { userid: UserId } });
  console.log('=== wxUser ===', wxUser);
  if (wxUser != null && wxUser.appUserId != null) {
    const appUser = await appUserRepo.findOne({ filter: { id: wxUser.appUserId } });
    return appUser;
  }

  // 如果没有则创建 appuser, 并更新 wxuser 的敏感信息和 app userd
  const userinfo = await WxSync.getUserInfoByTicket(access_token.access_token, user_ticket);
  console.log('=== userinfo ===', userinfo);
  if (userinfo == null) throw new Error('获取用户信息失败');
  if (userinfo.mobile == null || userinfo.biz_mail == null)
    throw new Error('用户信息不完整, 无手机号和邮箱信息,请授权获取手机号和邮箱等信息');

  const appUser = await WxSync.getOrCreateAppUser(ctx, userinfo);

  // 更新 wx user
  await wxUserRepo.update({
    values: {
      mobile: userinfo.mobile,
      email: userinfo.email,
      biz_mail: userinfo.biz_mail,
      address: userinfo.address,
      gender: userinfo.gender,
      appUserId: appUser.id,
    },
    filter: {
      userid: userinfo.userid,
    },
  });

  // 更新app user和 app dept 的关联 ；
  await WxSync.updateAppDeptUser(ctx, wxUser.dataValues, appUser.id);

  return appUser;
};

export const syncDeptUser = async (ctx: Context, next) => {
  // 同步部门
  const accessToken = await getAccessToken(ctx, undefined, undefined);
  const depts = await WxSync.GetDeptList(accessToken.access_token);
  for (const dept of depts) {
    const wxDept = await WxSync.getWxDept(ctx, dept.id);
    if (wxDept == null) {
      const appDept = await WxSync.createAppDept(ctx, dept);
      await WxSync.createWxDept(ctx, dept, appDept.id);
    } else {
      await WxSync.updateWxDept(ctx, dept);
      await WxSync.updateAppDept(ctx, dept, wxDept.appDeptId);
    }

    const users = await WxSync.GetDeptUsers(accessToken.access_token, dept.id);

    for (const user of users) {
      const record = await WxSync.createOrUpdateWxUser(ctx, user);
      console.log('=== record to recreate ===', record);
      await WxSync.recreateWxDeptUsers(ctx, record);
    }
  }

  await WxSync.buildUpdateAppDeptParent(ctx);
  await next();
};

export const enable = async (ctx: Context, next: Next) => {
  const values = ctx.action.params.values;
  const accessToken = await getAccessToken(ctx, values.corpid, values.secret);

  const setting = await ctx.db.getRepository('WxSetting').findOne({ filter: { id: 1 } });
  if (setting == null) {
    await ctx.db.getRepository('WxSetting').create({
      values: {
        id: 1,
        ...values,
        accessToken: accessToken.access_token,
        expiresAt: accessToken.expires_at,
        enabled: true,
      },
    });
  } else {
    await ctx.db.getRepository('WxSetting').update({
      values: {
        ...values,
        accessToken: accessToken.access_token,
        expiresAt: accessToken.expires_at,
        enabled: true,
      },
      filter: {
        id: 1,
      },
    });
  }

  await next();
};
