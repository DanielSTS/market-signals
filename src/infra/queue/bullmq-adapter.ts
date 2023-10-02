import { Queue } from 'bullmq';
import QueueAdapter from './queue-adapter';
import redisConfig from './redis-config';
import { JobName } from '../../application/handler/handler';

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
