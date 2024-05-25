import { Instruction, WorkflowVariableJSON, defaultFieldNames } from '@nocobase/plugin-workflow/client';

export default class extends Instruction {
  title = 'File To Base64';
  type = 'file2base64';
  group = 'extended';
  description = 'Convert file to base64';
  fieldset = {
    fileUrl: {
      type: 'string',
      required: true,
      title: '文件地址',
      'x-decorator': 'FormItem',
      'x-decorator-props': {},
      'x-component': 'WorkflowVariableJSON',
      'x-component-props': {
        placeholder: '',
      },
    },
  };
  components = {
    WorkflowVariableJSON,
  };
  useVariables({ key, title }, { types, fieldNames = defaultFieldNames }) {
    return {
      [fieldNames.value]: key,
      [fieldNames.label]: title,
    };
  }
}
