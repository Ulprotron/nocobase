import { getAppComponent } from '@nocobase/test/web';

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    'x-decorator': 'FormV2',
    'x-component': 'ShowFormData',
    'x-read-pretty': true,
    properties: {
      read1: {
        interface: 'string',
        type: 'string',
        default:
          'NocoBase is a scalability-first, open-source no-code/low-code platform for building business applications and enterprise solutions.',
        title: `Test`,
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
      },
      read2: {
        interface: 'string',
        type: 'string',
        title: `Test(ellipsis)`,
        'x-decorator': 'FormItem',
        default:
          'NocoBase is a scalability-first, open-source no-code/low-code platform for building business applications and enterprise solutions.',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          ellipsis: true,
          style: {
            width: '100px',
          },
        },
      },
      read3: {
        interface: 'string',
        type: 'string',
        title: `Test(autop)`,
        default:
          'NocoBase is a scalability-first, open-source no-code/low-code platform for building business applications and enterprise solutions.',
        'x-decorator': 'FormItem',
        'x-component': 'Input.TextArea',
        'x-component-props': {
          autop: true,
        },
      },
    },
  },
});

export default App;
