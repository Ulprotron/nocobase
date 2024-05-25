/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { Card, Form, Input, Button, message, Collapse } from 'antd';
import { useAPIClient, useRequest } from '@nocobase/client';

export const WxComSetting = () => {
  const apiClient = useAPIClient();
  const [form] = Form.useForm();

  const data = useRequest(
    {
      url: 'WxSetting:get/1',
    },
    {
      onSuccess(data) {
        form.setFieldsValue(data.data);
      },
    },
  );

  const onSync = async () => {
    try {
      await apiClient.request({
        url: 'WxSetting:sync',
        method: 'POST',
      });
      message.success('同步成功');
    } catch (err) {
      throw err;
    }
  };

  const onSubmit = async (values) => {
    console.log('values', values);
    try {
      await apiClient.request({
        url: 'WxSetting:enable',
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
      <Collapse bordered={false}>
        <Collapse.Panel key="step1" header="2. 对接信息录入">
          <Card>
            <Form form={form} onFinish={onSubmit}>
              <Form.Item label="Corp Id" name="corpid" required>
                <Input></Input>
              </Form.Item>
              <Form.Item label="Agent Id" name="agentid" required>
                <Input></Input>
              </Form.Item>
              <Form.Item label="Corp Secret" name="secret" required>
                <Input></Input>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  启用
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Collapse.Panel>
        <Collapse.Panel key="step2" header="3. 同步通讯录">
          <Button type="primary" htmlType="button" onClick={onSync}>
            同步通讯录
          </Button>
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};
