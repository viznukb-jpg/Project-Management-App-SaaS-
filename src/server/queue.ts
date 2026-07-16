import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) throw new Error('Cannot find REDIS_URL from .env!');

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const notificationQueue = new Queue('notificationQueue', { connection });
