import { constraintsProps, useApp } from '@nocobase/client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, message, Button } from 'antd';
import * as dd from 'dingtalk-jsapi';
import { Authenticator } from '@nocobase/plugin-auth/client';
import { initDingH5RemoteDebug } from 'dingtalk-h5-remote-debug';

export const DingtalkSignin = (props: { authenticator: Authenticator }) => {
  initDingH5RemoteDebug();

  const [authCode, setAuthCodce] = useState('');

  const onSignIn = () => {
    dd.getAuthCode({
      corpId: 'dinged63d72e86ece67035c2f4657eb6378f',
      success: (res) => {
        const { code } = res;
        message.success(code);
      },
      fail: () => {},
      complete: () => {},
    });
  };

  return (
    <Card title="钉钉登录">
      {' '}
      {authCode}
      <Button onClick={onSignIn}>钉钉登录</Button>
    </Card>
  );
};
