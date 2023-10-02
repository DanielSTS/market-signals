export default interface QueueAdapter {
  add(jobName: string, data: any): Promise<void>;
  close(): void;
}
