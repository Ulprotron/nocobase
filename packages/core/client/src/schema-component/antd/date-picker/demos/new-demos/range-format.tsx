import { getAppComponent } from '@nocobase/test/web';

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    'x-decorator': 'FormV2',
    'x-component': 'ShowFormData',
    properties: {
      test: {
        type: 'string',
        title: 'Test',
        'x-decorator': 'FormItem',
        default: ['2024-01-01 10:10:10', '2024-01-04 10:10:10'],
        'x-component': 'DatePicker.RangePicker',
        'x-component-props': {
          format: 'YYYY/MM/DD HH:mm:ss',
        },
      },
    },
  },
});

export default App;
