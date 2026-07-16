import 'dotenv/config';
import { Worker } from 'bullmq';
import { db } from './db/index.js';
import * as schema from './db/schema.js';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

console.log('Starting BullMQ worker on', redisUrl);

export const worker = new Worker(
  'notificationQueue',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { userId, type, message } = job.data;

    // Simulate email sending delay
    await new Promise((res) => setTimeout(res, 1000));
    console.log(
      `[Worker] Sent email notification to user ${userId}: ${message}`
    );

    // Save in-app notification to DB
    await db.insert(schema.notifications).values({
      userId,
      type,
      message,
    });
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
