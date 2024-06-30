/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import {
  SchemaInitializer,
  SchemaInitializerItem,
  SchemaInitializerItemType,
  SelectProps,
  useCollection,
  useCompile,
  useSchemaInitializer,
} from '@nocobase/client';
import { MenuOutlined } from '@ant-design/icons';

import { FieldNameLowercase } from '../constants';
import { getLadderDiscountByOrderSchema } from '../schema';

export function useFieldOptions(): SelectProps['options'] {
  const collection = useCollection();

  const compile = useCompile();
  return collection
    .getFields()
    .map((field) => ({ label: field.uiSchema?.title ? compile(field.uiSchema.title) : field.name, value: field.name }));
}

export const laddingDiscountByOrderInitializerItem: SchemaInitializerItemType = {
  type: 'item',
  name: FieldNameLowercase,
  icon: 'FileImageOutlined',
  useComponentProps() {
    const { insert } = useSchemaInitializer();
    return {
      title: '获取阶梯折扣（按单）',
      onClick: () => {
        insert(getLadderDiscountByOrderSchema('customer', 'full_amount', 'ladder_per_order_rate'));
      },
    };
  },
};
