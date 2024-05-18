/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useState } from 'react';
import { UploadFile, Upload, Form, Button, UploadProps, Image, message, Flex } from 'antd';
import { CameraOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { getBase64, FileType } from './utils';
import { useAPIClient, useRequest } from '@nocobase/client';
import { ClockProject } from '../server/models';

export const ClockOut = (props) => {
  const { location, onClock } = props;
  const apiClient = useAPIClient();
  const clockIn = props.clockIn;
  const [file, setFile] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [project, setProject] = useState<ClockProject>(null);

  console.log('clockIn', clockIn);

  useEffect(() => {
    if (location != null && clockIn != null) {
      apiClient
        .request({
          url: 'clock:distance',
          method: 'get',
          params: {
            id: clockIn.record_project_id,
            longitude: location.longitude,
            latitude: location.latitude,
          },
        })
        .then((data) => {
          console.log('get project distance', data);
          setProject(data.data.data[0]);
        })
        .catch((err) => {
          throw err;
        });
    }
  }, [location, clockIn]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const onRemove = (file) => {
    setFile([]);
    return true;
  };

  const onSubmit = (values) => {
    if (file.length === 0) {
      message.error('请上传人脸照片');
      return;
    }

    const args = {
      clock_out_picture: file,
      clock_out_time: new Date(),
      clock_out_distance: project.distance,
      clock_out_location: [location.longitude, location.latitude],
    };

    apiClient
      .request({
        url: `attendance_records:update/${clockIn.id}`,
        method: 'POST',
        data: args,
      })
      .then((data) => {
        props.OnClockCompleted();
      })
      .catch((err) => {
        throw err;
      });
  };

  const uploadButton = (
    <button style={{ border: 1, background: 'none' }} type="button">
      <CameraOutlined />
      <div style={{ marginTop: 8 }}>拍照</div>
    </button>
  );

  const uploadImage = async (options) => {
    const { onSuccess, onError, file } = options;

    const fmData = new FormData();
    fmData.append('file', file);
    try {
      const res = await apiClient.request({
        url: 'attachments:create',
        method: 'POST',
        data: fmData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFile([{ id: res.data.data.id }]);

      onSuccess(file);
      console.log('server res: ', res);
    } catch (err) {
      console.log('Eroor: ', err);
      onError({ err });
    }
  };

  return (
    <div>
      <Form
        className="clock-out-form"
        onFinish={onSubmit}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <div className="top-info">
          <Flex justify="center">
            <div className="left">
              <div className="label">上班</div>
              <div>
                <CheckCircleTwoTone style={{ color: '014DFF' }}></CheckCircleTwoTone>
                {` ${new Date(clockIn.clock_in_time).getHours()}:${new Date(
                  clockIn.clock_in_time,
                ).getMinutes()} 已打卡`}
              </div>
            </div>
            <div className="right">
              <div className="label">下班</div>
              <div>未打卡</div>
            </div>
          </Flex>
        </div>
        <div className="item">
          <div className="label">打卡项目</div>
          <div className="text">
            {project && (
              <Flex justify="space-between">
                <div>{project.name}</div>
                <div> 距离：{project.distance} 米</div>
              </Flex>
            )}
          </div>
        </div>

        <Flex className="item" justify="space-between" align="center">
          <div className="label">拍照（必填）</div>
          <div>
            <Upload
              customRequest={uploadImage}
              listType="picture-card"
              capture="user"
              accept="image/*"
              onRemove={onRemove}
              onPreview={handlePreview}
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
          </div>
        </Flex>

        <Form.Item>
          <Button size="large" type="primary" block htmlType="submit">
            下班打卡
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
