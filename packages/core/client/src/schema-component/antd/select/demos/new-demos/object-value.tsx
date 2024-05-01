import { getAppComponent } from '@nocobase/test/web';

const options = [
  {
    label: '福建',
    value: 'FuJian',
    children: [
      { label: '{{t("福州")}}', value: 'FZ' },
      { label: '莆田', value: 'PT' },
    ],
  },
  { label: '江苏', value: 'XZ' },
  { label: '浙江', value: 'ZX' },
];

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
        enum: options,
        'x-decorator': 'FormItem',
        'x-component': 'Select',
        'x-component-props': {
          objectValue: true,
        },
      },
    },
  },
});

export default App;
