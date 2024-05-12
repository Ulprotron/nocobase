/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useState, useRef } from 'react';
import { css, cx, useViewport, CurrentUserProvider, useAPIClient } from '@nocobase/client';
import { ClockIn } from './clockIn';
import { ClockOut } from './clockOut';
import { Attendance, ClockProject } from '../server/models';
import './index.css';

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

  const myMap = useRef<any>(null);
  const mapLayer = useRef<any>(null);
  const mapNode = useRef<any>(null);

  const mapkey = '63IBZ-CZ7C5-75BIE-I6OEX-WMXGE-KJBFQ';

  let TMap: any;
  let qq: any;

  const TMapGL = (key: string): Promise<any> => {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = 'TMap';
      script.src = 'https://map.qq.com/api/gljs?v=1.exp&key=' + key;
      script.onerror = (err) => reject(err);
      script.onload = (e) => {
        TMap = (window as any).TMap;
        resolve(e);
      };
      document.head.appendChild(script);
    });
  };

  const TLocationGL = (): Promise<any> => {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://mapapi.qq.com/web/mapComponents/geoLocation/v/geolocation.min.js';
      script.onerror = (err) => reject(err);
      script.onload = (e) => {
        qq = (window as any).qq;
        resolve(e);
      };
      document.head.appendChild(script);
    });
  };

  const initLocation = () => {
    TLocationGL()
      .then((res) => {
        console.log('qq', (window as any).qq);
        const geolocation = new qq.maps.Geolocation(mapkey, 'web-map-demo');
        geolocation.watchPosition(getPosition);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const getPosition = (position: any) => {
    myMap.current.setCenter(new TMap.LatLng(position.lat, position.lng));
    addOnePoint({ latLng: new TMap.LatLng(position.lat, position.lng) });
    setLocation({ longitude: position.lng, latitude: position.lat });

    apiClient
      .request({
        url: 'clock:projects',
        method: 'get',
        params: {
          longitude: position.lng,
          latitude: position.lat,
        },
      })
      .then((res) => {
        console.log('projects', res);
        setProjects(res.data.data);
      })
      .catch((err) => {
        throw err;
      });
  };

  const addOnePoint = (e: any) => {
    const lat = e.latLng.getLat();
    const lng = e.latLng.getLng();
    //console.log("您点击的的坐标是："+ lat + "," + lng);

    const markers = [
      {
        id: ((Math.random() * 100000) % 100000) + '', //点标记唯一标识，后续如果有删除、修改位置等操作，都需要此id
        styleId: 'marker', //指定样式id
        // "position": new TMap.LatLng(lat + Math.random() / 100, lng + Math.random() / 100),  //点标记坐标位置
        position: e.latLng, //点标记坐标位置
        properties: {
          title: 'defaultMarker',
        },
      },
    ];
    mapLayer.current.add(markers);
  };

  const initMap = () => {
    //定义地图中心点坐标
    TMapGL(mapkey)
      .then(() => {
        console.log('TMap', TMap);
        const center = new TMap.LatLng(39.160001, 117.15615);
        const myOptions = {
          zoom: 18,
          center,
        };
        const dom = mapNode.current;
        //创建地图，绑定dom
        //console.log('dom', dom);

        const map = new TMap.Map(dom, myOptions);
        //Map实例创建后，通过on方法绑定点击事件
        //map.on("click", onClickMap)
        myMap.current = map;

        //创建并初始化MultiMarker
        mapLayer.current = new TMap.MultiMarker({
          map: map, //指定地图容器
          //样式自定义
          styles: {
            //创建一个styleId为"myStyle"的样式（styles的子属性名即为styleId）
            marker: new TMap.MarkerStyle({
              width: 25, // 点标记样式宽度（像素）
              height: 25, // 点标记样式高度（像素）
              src: `${process.env.PUBLIC_URL}/logo192.png`, //图片路径，不设置会使用腾讯地图默认的红标
              //焦点在图片中的像素位置，一般大头针类似形式的图片以针尖位置做为焦点，圆形点以圆心位置为焦点
              anchor: { x: 16, y: 32 },
            }),
          },
        });
        initLocation();
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  useEffect(() => {
    initMap();
    return () => {
      mapNode.current = null;
    };
  }, [mapNode]);

  const href = window.parent ? window.parent.location.href.split('#')[0] : window.location.href.split('#')[0];

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
        <div id="mymap" style={{ width: '100%', height: '60%' }} ref={mapNode}></div>
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
