import React, { useEffect, useMemo } from 'react';
import { useAPIClient, useAppSpin, useRequest } from '@nocobase/client';
import { Card, Form, Button, Input, message, Collapse, Divider } from 'antd';

interface DingtalkSettingModel {
  key: string;
  secret: string;
}

const DingtalkSettingConfiguration: React.FC<any> = () => {
  const { render } = useAppSpin();
  const [form] = Form.useForm();
  const apiClient = useAPIClient();

  const data = useRequest<DingtalkSettingModel>(
    {
      url: 'DingtalkSetting:get/1',
    },
    {
      onSuccess(data) {
        form.setFieldsValue(data.data);
      },
    },
  );

  if (data.loading) {
    return render();
  }

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

  const onSync = async () => {
    try {
      await apiClient.request({
        url: 'DingtalkSetting:sync',
        method: 'POST',
      });
      message.success('同步成功');
    } catch (err) {
      throw err;
    }
  };

  return (
    <Collapse bordered={false}>
      <Collapse.Panel key="step1" header="2. 对接信息录入">
        <Form form={form} onFinish={onSubmit} layout="vertical">
          <Form.Item name="corpId" required label="Corp Id">
            <Input />
          </Form.Item>
          <Form.Item name="key" required label="Client Key">
            <Input />
          </Form.Item>
          <Form.Item name="secret" required label="Client Secret">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              启用
            </Button>
          </Form.Item>
        </Form>
      </Collapse.Panel>

      <Collapse.Panel key="step2" header="3. 同步通讯录">
        <Button type="primary" htmlType="button" onClick={onSync}>
          同步通讯录
        </Button>
      </Collapse.Panel>
    </Collapse>
  );
};

export const DingtalkSetting = () => {
  return (
    <Card>
      <DingtalkSettingConfiguration></DingtalkSettingConfiguration>
    </Card>
  );
};
