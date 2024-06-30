/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { getLadderDiscount } from './actions/index';
export class PluginJxLadderDiscountByOrderServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'ladder-discount',
      actions: {
        get: getLadderDiscount,
      },
    });

    this.app.acl.allow('ladder-discount', '*', 'public');
    // this.app.acl.allow('ladder_quotations', '*', 'public');
    // this.app.acl.allow('ladder_quotations_details', '*', 'public');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginJxLadderDiscountByOrderServer;
