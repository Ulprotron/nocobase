import React from 'react';
import axios from 'axios';
import { Context } from '@nocobase/actions';

interface AccessToken {
  access_token: string;
  expires_at: Date;
}

export class BaiduApi {
  static getAccessToken = async (ctx: Context) => {
    const token = await ctx.cache.get<AccessToken>('baidu_access_token');
    if (token != null && token.expires_at.getTime() > Date.now()) return token;

    const res = await axios.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/oauth/2.0/token',
      params: {
        grant_type: 'client_credentials',
        client_id: 'PaUWeGyfKedBbR0Hlx2IsG9w',
        client_secret: 'y1bGpjmwckxMTk4C5g6AYQcxydX9e4ey',
      },
    });

    if (res.status != 200) throw Error(res.data.error_description);
    console.log('get access token res', res.data);
    const newToken = {
      access_token: res.data.access_token,
      expires_at: new Date(Date.now() + res.data.expires_in * 1000),
    };
    await ctx.cache.set('baidu_access_token', newToken);
    return newToken;
  };

  static faceMatch = async (ctx: Context) => {
    const { image1, image2 } = ctx.action.params.values as any;

    const token = await this.getAccessToken(ctx);

    const result = await axios.request({
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/match',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        access_token: token.access_token,
      },
      data: [
        {
          image: image1,
          image_type: 'BASE64',
          face_type: 'LIVE',
          quality_control: 'LOW',
          liveness_control: 'HIGH',
        },
        {
          image: image2,
          image_type: 'BASE64',
          face_type: 'LIVE',
          quality_control: 'LOW',
          liveness_control: 'HIGH',
        },
      ],
    });

    return result.data;
  };
}
