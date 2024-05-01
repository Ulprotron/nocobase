import { useActionContext } from '@nocobase/client';
import { getAppComponent } from '@nocobase/test/web';

const App = getAppComponent({
  schema: {
    type: 'void',
    name: 'root',
    properties: {
      test: {
        type: 'void',
        'x-component': 'Action',
        title: 'Open',
        'x-component-props': {
          openMode: 'drawer',
        },
        properties: {
          drawer: {
            type: 'void',
            'x-component': 'Action.Container',
            title: 'Title',
            properties: {
              footer: {
                type: 'void',
                'x-component': 'Action.Container.Footer',
                properties: {
                  close: {
                    title: 'Close',
                    'x-component': 'Action',
                    'x-use-component-props': function useActionProps() {
                      const { setVisible } = useActionContext();
                      return {
                        type: 'default',
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
      },
    },
  },
});

export default App;
