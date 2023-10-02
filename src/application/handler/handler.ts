export type JobName = 'ExecuteBacktest' | 'CalculateStats';

export default interface Handler {
  readonly key: JobName;
  handle(data: any): void;
}
