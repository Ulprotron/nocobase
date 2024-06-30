/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import axios from 'axios';
import { Context } from '@nocobase/actions';
import { DataTypes, QueryTypes, Model } from 'sequelize';

export const getLadderDiscount = async (ctx: Context, next) => {
  const { customerId, totalAmount } = ctx.action.params;

  const sequelize = ctx.db.sequelize;
  const rate = await sequelize.query<any>(
    `SELECT a.rate from ladder_quotations_details a
    LEFT JOIN ladder_quotations b on b.id=a.quotationId
    WHERE b.customerId=${customerId} AND a.startAmount<= ${totalAmount} AND a.endAmount>${totalAmount} and b.type='按单累计'`,
    {
      type: QueryTypes.SELECT,
    },
  );

  ctx.body = rate;
  await next();
};
