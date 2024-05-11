/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import { getWXConfig, getProjectListByDistance, getUnClosedClockIn, getProjectWithDistance } from './actions/index';

export class PluginFuzhijiaClockServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    this.app.resourceManager.define({
      name: 'clock',
      actions: {
        wxconfig: getWXConfig,
        projects: getProjectListByDistance,
        unClockOut: getUnClosedClockIn,
        distance: getProjectWithDistance,
      },
    });

    this.app.acl.allow('attendance_records', '*', 'public');
    this.app.acl.allow('clock', '*', 'public');
    this.app.acl.allow('attachments', '*', 'public');
  }

  async install() {}
  async afterEnable() {}
  async afterDisable() {}
  async remove() {}
}

export default PluginFuzhijiaClockServer;
