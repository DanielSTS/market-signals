export type JobName = 'ExecuteBacktest';

export default interface Handler {
  readonly key: JobName;
  handle(data: any): void;
}
