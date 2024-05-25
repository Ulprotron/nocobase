import { Processor, Instruction, JOB_STATUS, FlowNodeModel } from '@nocobase/plugin-workflow';
import axios, { AxiosRequestConfig } from 'axios';

interface IFile2Base64Config {
  fileUrl: { url: string };
}

export type File2Base64Config = Pick<IFile2Base64Config, 'fileUrl'>;

async function convert(config: File2Base64Config) {
  return axios
    .request({
      url: config.fileUrl.url,
      method: 'get',
      responseType: 'arraybuffer',
    })
    .then((response) => {
      return Buffer.from(response.data, 'binary').toString('base64');
    });
}

export default class extends Instruction {
  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const config = processor.getParsedValue(node.config, node.id) as File2Base64Config;

    console.log('config', config);
    const { workflow } = processor.execution;
    const sync = this.workflow.isWorkflowSync(workflow);

    if (sync) {
      try {
        const result = await convert(config);
        return {
          status: JOB_STATUS.RESOLVED,
          result,
        };
      } catch (error) {
        return {
          status: JOB_STATUS.FAILED,
          result: error.isAxiosError ? error.toJSON() : error.message,
        };
      }
    }

    const job = await processor.saveJob({
      status: JOB_STATUS.PENDING,
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: prevJob?.id ?? null,
    });

    // eslint-disable-next-line promise/catch-or-return
    convert(config)
      .then((result) => {
        job.set({
          status: JOB_STATUS.RESOLVED,
          result,
        });
      })
      .catch((error) => {
        job.set({
          status: JOB_STATUS.FAILED,
          result: error.isAxiosError ? error.toJSON() : error.message,
        });
      })
      .finally(() => {
        processor.logger.info(`request (#${node.id}) response received, status: ${job.get('status')}`);
        this.workflow.resume(job);
      });

    return processor.exit();
  }
  async resume(node: FlowNodeModel, job, processor: Processor) {
    job.set('status', JOB_STATUS.RESOLVED);
    return job;
  }
}
