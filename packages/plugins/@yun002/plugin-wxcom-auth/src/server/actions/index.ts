/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, DEFAULT_PAGE, DEFAULT_PER_PAGE, Next } from '@nocobase/actions';
import axios from 'axios';
import { AccessToken, WxcomDept } from '../models/index';
import wxcomDept from '../collections/wxcomDept';
import wxcomUser from '../collections/wxcomUser';
import json from 'packages/core/client/src/schema-component/antd/input/demos/json';

const getAccessToken = async (ctx: Context, corpid: string, secret: string) => {
  const cache = await ctx.cache.get<AccessToken>('wxcom_access_token');
  if (!cache && cache.expires_at > new Date()) return cache.access_token;

  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`;
  const res = await axios.get(url);
  const data = res.data;
  if (data.errcode != 0) throw Error(data.errmsg);

  const token = {
    access_token: data.access_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000),
  };

  await ctx.cache.set('wxcom_access_token', token);
  return token.access_token;
};

export const SyncDeptUser = async (ctx: Context, next) => {
  const setting = await ctx.db.getRepository('WxcomSetting').findOne({ filter: { id: 1 } });

  if (setting == null || !setting.enabled) throw Error('未配置企微集成');

  const accessToken = await getAccessToken(ctx, setting.corpid, setting.secret);
  const res = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/department/simplelist?access_token=' + accessToken);
  const data = res.data;
  if (data.errcode != 0) throw Error(data.errmsg);

  const depts = data.department_id.map((d) => {
    return {
      deptid: d.id,
      parentid: d.parentid,
      order: d.order,
    };
  });

  const users = [];
  for (const dept of depts) {
    const res = await axios.get(
      'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?access_token=' +
        accessToken +
        '&department_id=' +
        dept.deptId,
    );
    const data = res.data;
    if (data.errcode != 0) throw Error(data.errmsg);

    for (const user of data.userlist) {
      users.push({
        userid: user.userid,
        name: user.name,
        department: JSON.stringify(user.department),
        open_userid: user.open_userid,
      });
    }
  }

  const deptRepo = ctx.db.getRepository('WxcomDept');
  const userRepo = ctx.db.getRepository('WxcomUser');

  await deptRepo.createMany({ records: depts });
  await userRepo.createMany({ records: users });

  await next();
};
