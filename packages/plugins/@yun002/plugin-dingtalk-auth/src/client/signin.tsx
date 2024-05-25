/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { constraintsProps, useApp, useAPIClient, useCurrentUserContext } from '@nocobase/client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, message, Button, Form } from 'antd';
import * as dd from 'dingtalk-jsapi';
import { Authenticator, useSignIn } from '@nocobase/plugin-auth/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DingtalkCircleFilled } from '@ant-design/icons';

export function useRedirect(next = '/admin') {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return useCallback(() => {
    navigate(searchParams.get('redirect') || '/admin', { replace: true });
  }, [navigate, searchParams]);
}

export const DingtalkSignin = (props: { authenticator: Authenticator }) => {
  const { name, options } = props.authenticator;
  const apiClient = useAPIClient();
  const redirect = useRedirect();
  const { refreshAsync } = useCurrentUserContext();
  const [corpId, setCorpId] = useState<string>('');
  const isDingtalk = window.navigator.userAgent.toLowerCase().indexOf('dingtalk') > -1;

  useEffect(() => {
    apiClient
      .request({
        url: 'DingtalkSetting:getCorpId',
      })
      .then((res) => {
        console.log(res);
        res.data && setCorpId(res.data.data.corpId);
      })
      .catch((err) => {
        throw err;
      });
  }, []);

  const onSignIn = () => {
    dd.getAuthCode({
      corpId: corpId,
      success: (res) => {
        const { code } = res;
        apiClient.auth
          .signIn({ code }, name)
          .then(() => {
            refreshAsync();
            redirect();
          })
          .catch((err) => {
            throw err;
          });
      },
      fail: () => {},
      complete: () => {},
    });
  };

  return (
    isDingtalk && (
      <Button onClick={onSignIn} icon={<DingtalkCircleFilled color="#01A0FF" />} block>
        钉钉登录
      </Button>
    )
  );
};
