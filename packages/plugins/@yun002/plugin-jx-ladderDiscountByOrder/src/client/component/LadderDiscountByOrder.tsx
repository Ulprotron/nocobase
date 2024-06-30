/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { observer } from '@formily/react';
import { Spin } from 'antd';
import React, { FC } from 'react';
import { useForm } from '@formily/react';
import { FieldComponentName } from '../constants';
import { useRequest } from '@nocobase/client';

export interface LadderDiscountByOrderProps {
  customerIdField: string;
  totalAmountField: string;
  discountValueField: string;
}

export const LadderDiscountByOrder: FC<LadderDiscountByOrderProps> = observer(
  ({ customerIdField, totalAmountField, discountValueField }) => {
    const form = useForm();

    const customerIdVal = form.values.customer?.id;
    const totalAmountVal = form.values['full_amount'];

    const { data, loading } = useRequest<{ data: any }>(
      { url: `ladder-discount:get?customerId=${customerIdVal}&totalAmount=${totalAmountVal}` },
      {
        ready: !!customerIdVal && totalAmountVal > 0,
        refreshDeps: [customerIdVal, totalAmountVal],
      },
    );

    if (loading) {
      return (
        <div style={{ textAlign: 'center', height: 200 }}>
          <Spin />
        </div>
      );
    }

    if (data?.data && data.data.length > 0) {
      form.values['ladder_per_order_rate'] = data.data[0].rate;
      return <pre></pre>;
    }
  },
  { displayName: FieldComponentName },
);
``;
