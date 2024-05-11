/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useState } from 'react';
import { css, cx, useViewport, CurrentUserProvider, useAPIClient } from '@nocobase/client';
import { ClockIn } from './clockIn';
import { ClockOut } from './clockOut';
import { message } from 'antd';
import { Attendance, ClockProject } from '../server/models';
import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import './index.css';

import wx from 'weixin-js-sdk';

const commonCSSVariables = css`
  --nb-spacing: 14px;
`;
const commonCSSOverride = css``;
const commonDesignerCSS = css`
  --nb-designer-top: 2px;
  --nb-designer-right: 2px;
  .nb-sortable-designer:hover {
    position: relative;
    > .general-schema-designer {
      display: block;
    }
  }
  .general-schema-designer {
    position: absolute;
    z-index: 999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: none;
    border: 0;
    pointer-events: none;
    > .general-schema-designer-icons {
      position: absolute;
      top: var(--nb-designer-top);
      right: var(--nb-designer-right);
      line-height: 16px;
      pointer-events: all;
      .ant-space-item {
        background-color: var(--colorSettings);
        color: #fff;
        line-height: 16px;
        width: 16px;
        padding-left: 1px;
        align-self: stretch;
      }
    }
  }
`;

export const Clock = () => {
  const apiClient = useAPIClient();
  const [unClock, setUnClock] = useState<Attendance | null>(null);
  const [location, setLocation] = useState({ longitude: 0, latitude: 0 });
  const [projects, setProjects] = useState<ClockProject[]>([]);

  useEffect(() => {
    apiClient
      .request({
        url: 'clock:unClockOut',
      })
      .then((data) => {
        if (data.data) {
          setUnClock(data.data.data);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, []);

  let map = null;
  const accessKey = '68b03bd9484f6ccb4c55ba7dbfe181bf';
  const securityJsCode = '404b7ebe0e5a6bc5666dfb8ae34bafa1';
  const href = window.parent ? window.parent.location.href.split('#')[0] : window.location.href.split('#')[0];

  useEffect(() => {
    if (!accessKey || map) return;

    if (securityJsCode) {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: securityJsCode,
      };
    }

    const _define = (window as any).define;
    (window as any).define = undefined;
    AMapLoader.load({
      key: accessKey,
      version: '2.0',
      plugins: ['AMap.MouseTool', 'AMap.PolygonEditor', 'AMap.PolylineEditor', 'AMap.CircleEditor', 'AMap.Geolocation'],
    })
      .then((amap) => {
        (window as any).define = _define;
        return requestIdleCallback(() => {
          map = new amap.Map('mymap', {
            resizeEnable: true,
            zoom: 18,
          } as AMap.MapOptions);

          apiClient
            .request({
              url: 'clock:wxconfig',
              params: {
                url: href,
              },
            })
            .then((data) => {
              console.log('wxconfig', data);
              wx.config({
                appId: data.data.data.appId,
                timestamp: data.data.data.timestamp,
                nonceStr: data.data.data.noncestr,
                signature: data.data.data.signature,
                jsApiList: ['getLocation'],
              });

              wx.ready(function () {
                wx.getLocation({
                  type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                  success: function (res) {
                    const latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                    const longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。

                    setLocation({ longitude, latitude });

                    const marker = new AMap.Marker({
                      position: new AMap.LngLat(longitude, latitude), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                      title: '我的位置',
                    });

                    map.add(marker);
                    map.setCenter([longitude, latitude]);

                    apiClient
                      .request({
                        url: 'clock:projects',
                        params: {
                          longitude,
                          latitude,
                        },
                      })
                      .then((data) => {
                        setProjects(data.data.data);
                      })
                      .catch((err) => {
                        throw err;
                      });
                  },
                });
              });
            })
            .catch((err) => {
              throw err;
            });
        });
      })
      .catch((err) => {
        if (typeof err === 'string') {
          message.error(err);
          throw err;
        }
      });

    return () => {
      map?.destroy();
      map = null;
    };
  }, [accessKey, securityJsCode]);

  const OnClockCompleted = () => {
    window.location.reload();
  };

  useViewport();
  return (
    <CurrentUserProvider>
      <div
        className={cx(
          'nb-mobile-application',
          commonDesignerCSS,
          commonCSSVariables,
          commonCSSOverride,
          css`
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
          `,
        )}
      >
        <div id="mymap" style={{ width: '100%', height: '60%' }}></div>
        <div
          style={{ position: 'absolute', bottom: 0, background: '#fff', zIndex: 998, width: '100%', padding: '20px' }}
        >
          {unClock && <ClockOut clockIn={unClock} location={location} OnClockCompleted={OnClockCompleted}></ClockOut>}

          {!unClock && <ClockIn location={location} projects={projects} OnClockCompleted={OnClockCompleted}></ClockIn>}
        </div>
      </div>
    </CurrentUserProvider>
  );
};
