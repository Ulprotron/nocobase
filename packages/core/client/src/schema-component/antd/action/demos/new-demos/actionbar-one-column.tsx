import { ActionInitializer, SchemaInitializer } from '@nocobase/client';
import { getAppComponent } from '@nocobase/test/web';

const addActionButton = new SchemaInitializer({
  name: 'addActionButton',
  designable: true,
  title: 'Configure actions',
  style: {
    marginLeft: 8,
  },
  items: [
    {
      type: 'itemGroup',
      title: 'Enable actions',
      name: 'enableActions',
      children: [
        {
          name: 'action1',
          title: '{{t("Action 1")}}',
          Component: 'ActionInitializer',
          schema: {
            title: 'Action 1',
            'x-component': 'Action',
            'x-action': 'a1', // unique identifier
          },
        },
        {
          name: 'action2',
          title: '{{t("Action 2")}}',
          Component: 'ActionInitializer',
          schema: {
            title: 'Action 2',
            'x-component': 'Action',
            'x-action': 'a2', // unique identifier
          },
        },
      ],
    },
  ],
});

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    properties: {
      test: {
        type: 'void',
        'x-component': 'ActionBar',
        'x-initializer': 'addActionButton',
        'x-component-props': {
          layout: 'one-column',
        },
        properties: {
          a1: {
            title: 'Action 1',
            'x-component': 'Action',
            'x-action': 'a1',
          },
          a2: {
            title: 'Action 2',
            'x-component': 'Action',
            'x-action': 'a2',
          },
        },
      },
    },
  },
  appOptions: {
    schemaInitializers: [addActionButton],
    components: {
      ActionInitializer,
    },
  },
});

export default App;
