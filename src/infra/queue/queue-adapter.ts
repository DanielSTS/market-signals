export type JobName = 'ExecuteBacktest';

export default interface QueueAdapter {
  add(jobName: JobName, data: any): Promise<void>;
}
