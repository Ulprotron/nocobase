/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  SchemaInitializerItemType,
  useCollectionDataSource,
  useCollectionManager_deprecated,
  useCompile,
} from '@nocobase/client';

import { CollectionBlockInitializer } from '../../components/CollectionBlockInitializer';
import { NAMESPACE, lang } from '../../locale';
import { getCollectionFieldOptions } from '../../variable';
import { Trigger } from '..';
import { ScheduleConfig } from './ScheduleConfig';
import { SCHEDULE_MODE } from './constants';

export default class extends Trigger {
  sync = false;
  title = `{{t("Schedule event", { ns: "${NAMESPACE}" })}}`;
  description = `{{t("Triggered according to preset time conditions. Suitable for one-time or periodic tasks, such as sending notifications and cleaning data on a schedule.", { ns: "${NAMESPACE}" })}}`;
  fieldset = {
    config: {
      type: 'void',
      'x-component': 'ScheduleConfig',
      'x-component-props': {},
    },
  };
  scope = {
    useCollectionDataSource,
  };
  components = {
    ScheduleConfig,
  };
  useVariables(config, opts) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const compile = useCompile();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { getCollectionFields } = useCollectionManager_deprecated();
    const options: any[] = [];
    if (!opts?.types || opts.types.includes('date')) {
      options.push({ key: 'date', value: 'date', label: lang('Trigger time') });
    }

    // const depth = config.appends?.length
    //   ? config.appends.reduce((max, item) => Math.max(max, item.split('.').length), 1) + 1
    //   : 1;

    if (config.mode === SCHEDULE_MODE.DATE_FIELD) {
      const [fieldOption] = getCollectionFieldOptions({
        // depth,
        appends: ['data', ...(config.appends?.map((item) => `data.${item}`) || [])],
        ...opts,
        fields: [
          {
            collectionName: config.collection,
            name: 'data',
            type: 'hasOne',
            target: config.collection,
            uiSchema: {
              title: lang('Trigger data'),
            },
          },
        ],
        compile,
        getCollectionFields,
      });
      if (fieldOption) {
        options.push(fieldOption);
      }
    }
    return options;
  }
  useInitializers(config): SchemaInitializerItemType | null {
    if (!config.collection) {
      return null;
    }

    return {
      name: 'triggerData',
      type: 'item',
      title: `{{t("Trigger data", { ns: "${NAMESPACE}" })}}`,
      Component: CollectionBlockInitializer,
      collection: config.collection,
      dataPath: '$context.data',
    };
  }
}
