import { Context } from '@nocobase/actions';
import axios from 'axios';
import { createHash } from 'crypto';

export const encrypt = (algorithm, content) => {
  const hash = createHash(algorithm);
  hash.update(content);
  return hash.digest('hex');
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

export type WxAccessToken = {
  access_token: string;
  expires_at: Date;
};

export type WxJsTicket = {
  ticket: string;
  expires_at: Date;
};

export interface AMapDirectionResponse {
  status: number;
  info: string;
  count: number;
  route: [
    {
      origin: string;
      destination: string;
      paths: [
        {
          distance: string;
          duration: string;
        },
      ];
    },
  ];
}

export const getProjectListByDistance = async (ctx: Context) => {
  const { origin, destination } = ctx.action.params;

  const result = await axios.request<AMapDirectionResponse>({
    url: 'https://restapi.amap.com/v3/direction/walking',
    method: 'get',
    params: {
      origin: origin,
      destination: destination,
      key: '7bcdde30e88feeb57fc380753b9a31d4',
    },
  });
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
