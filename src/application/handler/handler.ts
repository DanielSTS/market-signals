import { Job } from 'bullmq';
import { JobName } from '../../infra/queue/queue-adapter';

export default interface Handler {
  readonly key: JobName;
  handle(job: Job): void;
}
