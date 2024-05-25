import React, { useCallback } from 'react';

import { useAPIClient, useCurrentUserContext } from '@nocobase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function useRedirect(next = '/admin') {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return useCallback(() => {
    navigate(searchParams.get('state').split('@')[1] || '/admin', { replace: true });
  }, [navigate, searchParams]);
}

export const Callback = () => {
  const redirect = useRedirect();
  const { refreshAsync } = useCurrentUserContext();

  const apiClient = useAPIClient();
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const state = params.get('state');
  const authName = state.split('@')[0].split('=')[1];

  apiClient.auth
    .signIn({ code }, authName)
    .then(() => {
      refreshAsync();
      redirect();
    })
    .catch((err) => {
      throw err;
    });

  return (
    <div>
      <p>授权成功,正在登录... </p>
    </div>
  );
};
