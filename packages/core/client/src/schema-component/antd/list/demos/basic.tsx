import { BlockSchemaComponentPlugin } from '@nocobase/client';
import { getAppComponent } from '@nocobase/test/web';

const App = getAppComponent({
  designable: true,
  schema: {
    type: 'void',
    name: 'root',
    'x-decorator': 'List.Decorator',
    'x-use-decorator-props': 'useListBlockDecoratorProps',
    'x-decorator-props': {
      collection: 'roles',
      dataSource: 'main',
      action: 'list',
      params: {
        pageSize: 10,
      },
    },
    'x-component': 'CardItem',
    properties: {
      list: {
        type: 'array',
        'x-component': 'List',
        properties: {
          item: {
            type: 'object',
            'x-component': 'List.Item',
            'x-read-pretty': true,
            'x-use-component-props': 'useListItemProps',
            properties: {
              name: {
                type: 'string',
                'x-component': 'CollectionField',
                'x-decorator': 'FormItem',
                'x-index': 1,
              },
              title: {
                type: 'string',
                'x-component': 'CollectionField',
                'x-decorator': 'FormItem',
                'x-index': 2,
              },
            },
          },
        },
      },
    },
  },
  appOptions: {
    plugins: [BlockSchemaComponentPlugin],
  },
});

export default App;
