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
import { CameraOutlined, DownOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { UploadFile, UploadProps, Image, message, Flex, Drawer } from 'antd';
import { useAPIClient, useRequest, useCurrentUserContext } from '@nocobase/client';
import { getBase64, FileType } from './utils';
import { ClockInRequest, ClockProject, ClockPicture } from '../server/models';
import { Buffer } from 'buffer';

export interface WxConfig {
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

export const ClockIn = (props) => {
  const { location, projects, onClock, setSpinning } = props;
  const [selectedProject, setSelectedProject] = useState<ClockProject | null>(projects ? projects[0] : null);
  const [file, setFile] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [loadMapMessage, setLoadMapMessage] = useState<string | null>(null);
  const [drawOpen, setDrawOpen] = useState(false);
  const context = useCurrentUserContext();
  const [submitEnable, setSubmitEnable] = useState(true);
  const [profile_pciture, setProfile_pciture] = useState<string | null>(null);
  const [faceMatchCheck, setFaceMatchCheck] = useState<boolean>(null);

  useEffect(() => {
    setSelectedProject(projects ? projects[0] : null);
  }, [projects]);

  useEffect(() => {
    apiClient
      .request({
        url: 'employees:get',
        params: {
          appends: ['profile_picture'],
          filter: {
            user_id: context?.data?.data?.id,
          },
        },
      })
      .then((res) => {
        const url = `${window.location.origin}${res.data.data.profile_picture[0].url}`;
        apiClient
          .request({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer',
          })
          .then((res) => {
            const base64 = Buffer.from(res.data, 'binary').toString('base64');
            setProfile_pciture(base64);
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  }, []);

  const apiClient = useAPIClient();
  const handleChange: UploadProps['onChange'] = async ({ file }) => {};

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
    if (!selectedProject) {
      message.error('未获取到打卡项目，请检查是否授权获取位置信息');
      return;
    }

    if (faceMatchCheck == null || !faceMatchCheck) {
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
    setFaceMatchCheck(null);
    return true;
  };

  const uploadImage = async (options) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();
    fmData.append('file', file);
    setSpinning(true);
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
      handleChange(file);

      // 进行人脸识别对比；
      const base64 = await getBase64(file as FileType);
      const matchRes = await apiClient
        .request({
          url: 'clock:match',
          method: 'POST',
          data: {
            image1: profile_pciture,
            image2: base64.split(',')[1],
          },
        })
        .then((matchRes) => {
          const checked = matchRes.data.data.error_code == 0 && matchRes.data.data.result.score > 60;
          if (checked) {
            setFaceMatchCheck(true);
            setSubmitEnable(true);
          } else {
            setFaceMatchCheck(false);
            setSubmitEnable(false);
          }
          setSpinning(false);
        });
    } catch (err) {
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
          <div className="label">
            拍照（必填）
            {faceMatchCheck != null && faceMatchCheck && (
              <span style={{ color: '#1677ff' }}>
                <CheckCircleFilled /> 人脸识别通过
              </span>
            )}
            {faceMatchCheck != null && !faceMatchCheck && (
              <span style={{ color: 'red' }}>
                <CloseCircleFilled /> 人脸识别未通过，请重新拍照
              </span>
            )}
          </div>
          <div>
            <Upload
              customRequest={uploadImage}
              listType="picture-card"
              capture="user"
              accept="image/*"
              onChange={handleChange}
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
          <Button type="primary" size="large" block disabled={!submitEnable} htmlType="submit">
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
