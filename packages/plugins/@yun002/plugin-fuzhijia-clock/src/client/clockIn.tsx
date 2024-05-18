/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect } from 'react';
import { Upload, Form, Button } from 'antd';
import { CameraOutlined, DownOutlined } from '@ant-design/icons';
import { UploadFile, UploadProps, Image, message, Flex, Drawer } from 'antd';
import { useAPIClient, useRequest, useCurrentUserContext } from '@nocobase/client';
import { getBase64, FileType } from './utils';
import { ClockInRequest, ClockProject, ClockPicture } from '../server/models';

export interface WxConfig {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

export const ClockIn = (props) => {
  console.log('props', props);
  const { location, projects, onClock } = props;
  const [selectedProject, setSelectedProject] = useState<ClockProject | null>(projects ? projects[0] : null);
  const [file, setFile] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [loadMapMessage, setLoadMapMessage] = useState<string | null>(null);
  const [drawOpen, setDrawOpen] = useState(false);
  const context = useCurrentUserContext();
  context?.data?.data?.id;

  useEffect(() => {
    setSelectedProject(projects ? projects[0] : null);
  }, [projects]);

  const apiClient = useAPIClient();

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const uploadButton = (
    <div className="upload">
      <button style={{ border: 1, background: 'none' }} type="button">
        <CameraOutlined />
        <div style={{ marginTop: 4 }}>拍照</div>
      </button>
    </div>
  );

  const onSubmit = (values) => {
    if (file.length === 0) {
      message.error('请上传人脸照片');
      return;
    }

    console.log('file', file);

    if (!selectedProject) {
      message.error('未获取到打卡项目，请检查是否授权获取位置信息');
      return;
    }

    const args: ClockInRequest = {
      clock_in_picture: file as ClockPicture[],
      project_id: selectedProject.id,
      clock_in_time: new Date(),
      clock_in_distance: selectedProject.distance,
      clock_in_location: [location.longitude, location.latitude],
    };

    apiClient
      .request({
        url: 'clock:clockIn',
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

  const openProjectDrawer = () => {
    setDrawOpen(true);
  };

  const onClose = () => {
    setDrawOpen(false);
  };

  const onRemove = (file) => {
    setFile([]);
    return true;
  };

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
        onFinish={onSubmit}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
      >
        <Flex className="item line" justify="space-between">
          <div>
            <div className="label">打卡项目</div>
            <div className="text">
              {selectedProject && (
                <span>
                  {selectedProject.name} 距离：{selectedProject.distance} 米
                </span>
              )}
              {!selectedProject && <span>正在获取最近的打卡地点...</span>}
            </div>
          </div>
          <div>
            <DownOutlined onClick={openProjectDrawer}></DownOutlined>
          </div>
        </Flex>

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
          <Button type="primary" size="large" block htmlType="submit">
            上班打卡
          </Button>
        </Form.Item>
      </Form>
      <Drawer title="选择要打卡的项目" placement="bottom" open={drawOpen} onClose={onClose}>
        {projects.map((project) => {
          return (
            <div
              key={project.id}
              className="item line"
              onClick={() => {
                setSelectedProject(project);
                setDrawOpen(false);
              }}
            >
              <Flex justify="space-between" align="center">
                <div className="label">{project.name}</div>
                <div className="text"> {project.distance} 米</div>
              </Flex>
            </div>
          );
        })}
      </Drawer>
    </div>
  );
};
