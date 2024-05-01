import { getAppComponent } from '@nocobase/test/web';
import { Space, App as AntdApp } from 'antd';
import { ActionProps } from '@nocobase/client';

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    'x-component': Space,
    properties: {
      test: {
        type: 'void',
        'x-component': 'Action',
        title: 'Delete',
        'x-use-component-props': function useActionProps(): ActionProps {
          const { message } = AntdApp.useApp();

          return {
            confirm: {
              // confirm props
              title: 'Delete',
              content: 'Are you sure you want to delete it?',
            },
            onClick() {
              // after confirm ok
              message.success('Deleted!');
            },
          };
        },
      },
    },
  },
});

export default App;
