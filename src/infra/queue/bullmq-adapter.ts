import { Queue } from 'bullmq';
import QueueAdapter, { JobName } from './queue-adapter';
import redisConfig from './redis-config';

export class BullMQAdapter implements QueueAdapter {
  private bullQueue: Queue;

  constructor(queueName: JobName) {
    this.bullQueue = new Queue(queueName, {
      connection: redisConfig
    });
  }

  async add(jobName: JobName, data: any): Promise<void> {
    await this.bullQueue.add(jobName, data);
  }
}
