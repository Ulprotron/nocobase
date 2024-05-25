import { Context, Next } from '@nocobase/actions';
import { WxcomAuth } from '../wxcom-auth';
import { getCorpSetting } from './index';

export const redirect = async (ctx: Context, next: Next) => {
  const { authName } = ctx.action.params;

  // const app = ctx.app.name;
  const auth = ctx.auth as WxcomAuth;
  const setting = await getCorpSetting(ctx);
  // const redirectUrl = `${auth.getRedirectUri()}&redirect=${redirect}`;
  console.log('=== redirect ===', ctx.headers);

  const { referer = '' } = ctx.headers;

  const refererUrl = new URL(referer);
  console.log('=== refererUrl ===', refererUrl);
  const protocol = refererUrl.protocol;
  const redirect = refererUrl.searchParams.get('redirect');
  const host = refererUrl.host;

  const state = encodeURIComponent(`authName=${authName}@${redirect}`);
  const redirectUrl = `${protocol}//${host}/wxauth-callback`;
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
    setting.corpid
  }&redirect_uri=${encodeURIComponent(
    redirectUrl,
  )}&response_type=code&scope=snsapi_privateinfo&state=${state}&agentid=${setting.agentid}#wechat_redirect`;

  ctx.body = { redirect: authUrl };
  await next();
};
