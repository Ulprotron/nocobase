/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export type WxAccessToken = {
  access_token: string;
  expires_at: Date;
};

export type WxJsTicket = {
  ticket: string;
  expires_at: Date;
};

export type ClockProject = {
  id: number;
  name: string;
  distance: number;
};

export type Attendance = {
  id: number;
  employoee_id: number;
  project_id: number;
  clock_in_time: Date;
};

export interface UploadResponse {
  status: string;
  response: {
    data: {
      id: number;
    };
  };
}
