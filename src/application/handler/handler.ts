import { JobName } from '../../infra/queue/queue-adapter';

export default interface Handler {
  readonly key: JobName;
  handle(data: any): void;
}
