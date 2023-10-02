import { Queue } from 'bullmq';
import QueueAdapter from './queue-adapter';
import redisConfig from './redis-config';

export class BullMQAdapter implements QueueAdapter {
  private bullQueue: Queue;

  constructor(queueName: string) {
    this.bullQueue = new Queue(queueName, {
      connection: redisConfig
    });
  }

  async add(jobName: string, data: any): Promise<void> {
    await this.bullQueue.add(jobName, data);
  }
}
