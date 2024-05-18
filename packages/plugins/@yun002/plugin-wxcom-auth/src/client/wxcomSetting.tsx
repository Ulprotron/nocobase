/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useAPIClient } from '@nocobase/client';

export const WxComSetting = () => {
  const apiClient = useAPIClient();
  const onSubmit = async (values) => {
    try {
      await apiClient.request({
        url: 'DingtalkSetting:enable',
        method: 'POST',
        data: values,
      });
      message.success('保存成功');
    } catch (err) {
      throw err;
    }
  };

  return (
    <Card>
      <Form>
        <Form.Item label="Corp Id" name="corpid" required>
          <Input></Input>
        </Form.Item>
      </Form>
      <Form>
        <Form.Item label="Corp Secret" name="corpsecret" required>
          <Input></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            启用
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
