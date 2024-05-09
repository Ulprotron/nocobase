import { AuthConfig, BaseAuth } from '@nocobase/auth';
import { Model } from '@nocobase/database';

export class DingtalkAuth extends BaseAuth {
  constructor(config: AuthConfig) {
    const { ctx } = config;
    super({
      ...config,
      userCollection: ctx.db.getCollection('users'),
    });
  }

  // async validate() {
  //   const ctx = this.ctx;
  //   let user: Model;

  // }
}
