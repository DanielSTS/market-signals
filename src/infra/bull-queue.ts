import Bull, { Job, Queue } from 'bull';
import * as jobs from '../application/job';

const redisConfig = {
  host: 'localhost',
  port: 3333
};

export class BullQueue {
  private queues: {
    bull: Queue;
    name: string;
    handle: (job: Job) => Promise<void>;
  }[];

  constructor() {
    this.queues = Object.values(jobs).map(job => ({
      bull: new Bull(job.key, { redis: redisConfig }),
      name: job.key,
      handle: job.handle
    }));
  }

   async add(
    name: string,
    data: any,
    opts?: Bull.JobOptions
  ): Promise<void> {
    const queue = this.queues.find(q => q.name === name);
    if (queue) {
      await queue.bull.add(data, opts);
    }
  }

   process(): void {
    this.queues.forEach(queue => {
      queue.bull.process(queue.handle);
      queue.bull.on('failed', (job, err) => {
        console.log(`${job.data} ${err}`);
      });
    });
  }
}
