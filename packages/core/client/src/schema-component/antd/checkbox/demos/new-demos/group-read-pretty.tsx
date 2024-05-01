import { getAppComponent } from '@nocobase/test/web';

const options = [
  {
    label: '选项1',
    value: 1,
    color: 'red',
  },
  {
    label: '选项2',
    value: 2,
    color: 'blue',
  },
  {
    label: '选项3',
    value: 3,
    color: 'yellow',
  },
];

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    'x-decorator': 'FormV2',
    'x-component': 'ShowFormData',
    'x-pattern': 'readPretty',
    properties: {
      test1: {
        type: 'array',
        default: [1, 2],
        title: 'Test1',
        enum: options,
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
      },
      test2: {
        type: 'array',
        default: [1, 2, 3],
        title: 'Test2',
        enum: options,
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
        'x-decorator-props': {
          style: {
            width: 100,
          },
        },
        'x-component-props': {
          ellipsis: true,
        },
      },
    },
  },
});

export default App;
