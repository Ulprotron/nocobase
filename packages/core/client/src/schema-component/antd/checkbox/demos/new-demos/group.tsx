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
];

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    'x-decorator': 'FormV2',
    'x-component': 'ShowFormData',
    properties: {
      test: {
        type: 'array',
        title: 'Test',
        enum: options,
        'x-decorator': 'FormItem',
        'x-component': 'Checkbox.Group',
      },
    },
  },
});

export default App;
