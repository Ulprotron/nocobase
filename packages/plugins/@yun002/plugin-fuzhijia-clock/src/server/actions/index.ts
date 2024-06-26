/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context } from '@nocobase/actions';
import axios from 'axios';
import { createHash } from 'crypto';
import { DataTypes, QueryTypes, Model } from 'sequelize';
import { ClockProject, WxJsTicket, WxAccessToken, Attendance, ClockInRequest } from '../models/index';
import { BaiduApi } from './baiduApi';

export const encrypt = (algorithm, content) => {
  const hash = createHash(algorithm);
  hash.update(content);
  return hash.digest('hex');
};

export const clockIn = async (ctx: Context, next) => {
  console.log('clock in request', ctx.request.body);
  const { project_id, clock_in_picture, clock_in_distance, clock_in_location } = ctx.request.body as ClockInRequest;

  const userId = ctx.state.currentUser.id;
  const employeeRepo = ctx.db.getRepository('employees');
  const employee = await employeeRepo.findOne({
    filter: {
      user_id: userId,
    },
  });

  if (!employee) {
    throw new Error('employee not found');
  }

  console.log('clock in user', ctx.state.currentUser);
  console.log('clock in employee', employee);
  const repo = ctx.db.getRepository('attendance_records');
  const item = await repo.create({
    values: {
      employee_id: employee.dataValues.id,
      record_project_id: project_id,
      clock_in_time: new Date(),
      date: new Date(),
      clock_in_picture,
      clock_in_distance,
      clock_in_location,
    },
  });

  ctx.body = item;
  await next();
};

export const getWXConfig = async (ctx: Context, next) => {
  // 生成一个长度为16的随机字符串
  const noncestr = Math.random().toString(36).substr(2, 15);
  // 获取当前时间戳
  const timestamp = parseInt(String(Date.now() / 1000));
  // 获取当前页面的URL
  const url = ctx.query.url;
  // 获取jsapi_ticket
  const ticket = await getJSTicket(ctx);

  // 生成签名
  const signature = encrypt(
    'sha1',
    `jsapi_ticket=${ticket.ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`,
  );

  console.log('signature', signature);
  console.log('ticket', ticket.ticket);
  console.log('noncestr', noncestr);
  console.log('timestamp', timestamp);
  console.log('url', url);
  // 用sha1加密
  ctx.body = {
    appId: 'wx1472f96d9fe0b6a5',
    timestamp,
    noncestr,
    signature,
  };

  await next();
};

export const getUnClosedClockIn = async (ctx: Context, next) => {
  const userId = ctx.state.currentUser.id;
  const employeeRepo = ctx.db.getRepository('employees');
  const repo = ctx.db.getRepository('attendance_records');
  const employee = await employeeRepo.findOne({
    filter: {
      user_id: userId,
    },
  });

  if (!employee) {
    throw new Error('employee not found');
  }

  console.log('clock in employee', employee);

  const item = await repo.findOne({
    filter: {
      employee_id: employee.dataValues.id,
      clock_out_location: null,
    },
    appends: ['project'],
  });

  ctx.body = item;
  await next();
};

export const getProjectWithDistance = async (ctx: Context, next) => {
  const { id, longitude, latitude } = ctx.query;
  const repo = ctx.db.getRepository('projects');
  const sequelize = repo.database.sequelize;
  const projects = await sequelize.query<ClockProject>(
    `SELECT id, \`name\`, ST_Distance(location, POINT(${longitude}, ${latitude})) AS distance FROM projects WHERE id=${id}`,
    {
      type: QueryTypes.SELECT,
    },
  );

  ctx.body = projects.map((p) => {
    return {
      ...p,
      distance: (Number(p.distance) * 111195).toFixed(1),
    };
  });

  await next();
};

export const getProjectListByDistance = async (ctx: Context, next) => {
  const { longitude, latitude } = ctx.query;
  const repo = ctx.db.getRepository('projects');
  const sequelize = repo.database.sequelize;
  const projects = await sequelize.query<ClockProject>(
    `SELECT id, \`name\`, ST_Distance(location, POINT(${longitude}, ${latitude})) AS distance FROM projects ORDER BY distance LIMIT 10`,
    {
      type: QueryTypes.SELECT,
    },
  );

  ctx.body = projects.map((p) => {
    return {
      ...p,
      distance: (Number(p.distance) * 111195).toFixed(1),
    };
  });

  await next();
};

export const getJSTicket = async (ctx: Context) => {
  const cache = await ctx.cache.get<WxJsTicket>('weixin:jsticket');
  if (cache && cache.ticket) {
    if (Date.now() < cache.expires_at.getTime() - 120) return cache;
  } else {
    const access_token = await getWxAccessToken(ctx);
    const res = await axios.request({
      url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      method: 'get',
      params: {
        access_token: access_token.access_token,
        type: 'jsapi',
      },
    });

    const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
    const ticket = {
      ticket: res.data.ticket,
      expires_at: expiresAt,
    };
    await ctx.cache.set('weixin:jsticket', ticket);
    return ticket;
  }
};

export const faceMatch = async (ctx: Context, next) => {
  const result = await BaiduApi.faceMatch(ctx);
  ctx.body = result;
  await next();
};

export const getWxAccessToken = async (ctx: Context) => {
  const cache = await ctx.cache.get<WxAccessToken>('weixin:accessToken');
  if (cache && cache.access_token) {
    if (Date.now() < cache.expires_at.getTime() - 120) return cache;
  } else {
    const res = await axios.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      method: 'get',
      params: {
        grant_type: 'client_credential',
        appid: 'wx1472f96d9fe0b6a5',
        secret: '4b3b1ea0fab8ee2f37cd6942314f54ce',
      },
    });

    const expiresAt = new Date(Date.now() + res.data.expires_in * 1000);
    const accessToken = {
      access_token: res.data.access_token,
      expires_at: expiresAt,
    };

    console.log('accessToken', accessToken);

    await ctx.cache.set('weixin:accessToken', accessToken);

    return accessToken;
  }
};
