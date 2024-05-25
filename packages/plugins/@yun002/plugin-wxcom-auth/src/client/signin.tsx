import { constraintsProps, useApp, useAPIClient, useCurrentUserContext } from '@nocobase/client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, message, Button, Form } from 'antd';
import { Authenticator, useSignIn } from '@nocobase/plugin-auth/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WechatFilled } from '@ant-design/icons';

export const WxcomSignIn = (props: { authenticator: Authenticator }) => {
  const { name, options } = props.authenticator;
  const isWxcom = window.navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1;
  const apiClient = useAPIClient();
  const onSignIn = () => {
    apiClient
      .request({
        url: 'WxSetting:redirect',
        params: {
          authName: name,
        },
      })
      .then((res) => {
        console.log(res);
        window.location.href = res.data.data.redirect;
      })
      .catch((err) => {
        throw err;
      });
  };

  return (
    isWxcom && (
      <Button onClick={onSignIn} icon={<WechatFilled color="#01A0FF" />} block>
        企微登录
      </Button>
    )
  );
};
