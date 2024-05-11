/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { UploadFile, UploadProps } from 'antd';

export type GetProps<T extends React.ComponentType<any> | object> = T extends React.ComponentType<infer P>
  ? P
  : T extends object
    ? T
    : never;

export type GetProp<T extends React.ComponentType<any> | object, PropName extends keyof GetProps<T>> = NonNullable<
  GetProps<T>[PropName]
>;

export type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
