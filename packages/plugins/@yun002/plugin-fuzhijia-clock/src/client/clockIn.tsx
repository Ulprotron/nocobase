import React, { useState, useEffect } from 'react';
import { Upload, Form, Button } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { UploadFile, UploadProps, Image } from 'antd';
import wx from 'weixin-js-sdk';

import { useRequest } from '@nocobase/client';

import AMapLoader from '@amap/amap-jsapi-loader';
import '@amap/amap-jsapi-types';
import { Success } from 'packages/plugins/@nocobase/plugin-theme-editor/src/client/antd-token-previewer';

export interface WxConfig {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

export type GetProps<T extends React.ComponentType<any> | object> = T extends React.ComponentType<infer P>
  ? P
  : T extends object
    ? T
    : never;

export type GetProp<T extends React.ComponentType<any> | object, PropName extends keyof GetProps<T>> = NonNullable<
  GetProps<T>[PropName]
>;

export interface UploadResponse {
  status: string;
  response: {
    data: {
      id: number;
    };
  };
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function ClockIn() {
  const [file, setFile] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [location, setLocation] = useState({ longitude: 0, latitude: 0 });
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [loadMapMessage, setLoadMapMessage] = useState<string | null>(null);

  let map = null;
  const accessKey = '68b03bd9484f6ccb4c55ba7dbfe181bf';
  const securityJsCode = '404b7ebe0e5a6bc5666dfb8ae34bafa1';

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
            zoom: 11,
          } as AMap.MapOptions);
        });
      })
      .catch((err) => {
        if (typeof err === 'string') {
          if (err.includes('多个不一致的 key')) {
            //setErrMessage(t('The AccessKey is incorrect, please check it'));
          } else {
            // setErrMessage(err);
          }
        } else if (err?.type === 'error') {
          // message.error(err);
          setLoadMapMessage(err.message);
          // setErrMessage('Something went wrong, please refresh the page and try again');
        }
      });

    return () => {
      map?.destroy();
      map = null;
    };
  }, [accessKey, securityJsCode]);

  useRequest<WxConfig>(
    {
      url: 'clock:wxconfig',
      params: {
        url: window.location.href.split('#')[0],
      },
    },
    {
      onSuccess(data) {
        console.log('wxconfig data', data);
        wx.config({
          debug: true,
          appId: data.data.appId,
          timestamp: data.data.timestamp,
          nonceStr: data.data.noncestr,
          signature: data.data.signature,
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
                position: new AMap.LngLat(latitude, longitude), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: '我的位置',
              });

              //const markerList = [marker];
              map.add(marker);
              map.setCenter([latitude, longitude]);
            },
          });
        });
      },
    },
  );

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const uploadButton = (
    <button style={{ border: 1, background: 'none' }} type="button">
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>拍照</div>
    </button>
  );

  const onSubmit = (values) => {
    console.log('values', {
      file,
    });
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    if (fileList.length === 0) return;
    if (fileList[0].status == 'done') {
      setFile([{ id: fileList[0].response.data.id }]);
    }
  };

  return (
    <div>
      <Form
        onFinish={onSubmit}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <Form.Item label="打卡项目"></Form.Item>

        <Form.Item label="当前位置" required>
          <span>
            {location.longitude}, {location.latitude}{' '}
          </span>
          <span>{errMessage}</span>
          <span>{'加载地图： ' + loadMapMessage}</span>
          <div id="mymap" style={{ width: '100%', height: 200 }}></div>
        </Form.Item>

        <Form.Item label="人脸识别" name="picture" valuePropName="picture" required>
          <Upload
            action="/api/attachments:create"
            listType="picture-card"
            capture="user"
            accept="image/*"
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {file.length >= 1 ? null : uploadButton}
          </Upload>
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" size="large" block htmlType="submit">
            上班打卡
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
