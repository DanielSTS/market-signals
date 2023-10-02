import { Queue } from 'bullmq';
import QueueAdapter from './queue-adapter';

export class BullMQAdapter implements QueueAdapter {
  private bullQueue: Queue;

  constructor(queueName: string) {
    this.bullQueue = new Queue(queueName);
  }

  async add(jobName: string, data: any): Promise<void> {
    await this.bullQueue.add(jobName, data);
  }
}
