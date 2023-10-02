import { JobName } from '../../application/handler/handler';

export default interface QueueAdapter {
  add(jobName: JobName, data: any): Promise<void>;
}
