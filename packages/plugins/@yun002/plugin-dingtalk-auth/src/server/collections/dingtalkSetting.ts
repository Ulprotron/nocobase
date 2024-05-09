import { defineCollection } from '@nocobase/database';

export interface DingtalkSettingModel {
  id: bigint;
  key: string;
  secret: string;
  enabled: boolean;
  accessToken: string;
  corpId: string;
  expiresAt: Date;
}

export default defineCollection({
  name: 'DingtalkSetting',
  fields: [
    { type: 'string', name: 'corpId', title: 'CorpId' },
    { type: 'string', name: 'key', title: 'Client Key' },
    { type: 'string', name: 'secret', title: 'Client Secret' },
    { type: 'boolean', name: 'enabled', title: '是否启用' },
    { type: 'string', name: 'accessToken', title: '当前 AccessToken' },
    { type: 'date', name: 'expiresAt', title: '过期时间' },
  ],
});
