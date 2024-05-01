import { ISchema, observer } from '@formily/react';
import {
  Action,
  ActionContextProvider,
  Form,
  FormItem,
  Input,
  SchemaComponent,
  SchemaComponentProvider,
  useActionContext,
} from '@nocobase/client';
import React, { useState } from 'react';

const schema: ISchema = {
  type: 'object',
  properties: {
    drawer1: {
      'x-component': 'Action.Drawer',
      type: 'void',
      title: 'Drawer Title',
      properties: {
        hello1: {
          'x-content': 'Hello',
          title: 'T1',
        },
        footer1: {
          'x-component': 'Action.Drawer.Footer',
          type: 'void',
          properties: {
            close1: {
              title: 'Close',
              'x-component': 'Action',
              'x-use-component-props': function useActionProps() {
                const { setVisible } = useActionContext();
                return {
                  onClick() {
                    setVisible(false);
                  },
                };
              },
            },
          },
        },
      },
    },
  },
};

export default observer(() => {
  const [visible, setVisible] = useState(false);
  return (
    <SchemaComponentProvider components={{ Form, Action, Input, FormItem }}>
      <ActionContextProvider value={{ visible, setVisible }}>
        <a onClick={() => setVisible(true)}>Open</a>
        <SchemaComponent schema={schema} />
      </ActionContextProvider>
    </SchemaComponentProvider>
  );
});
