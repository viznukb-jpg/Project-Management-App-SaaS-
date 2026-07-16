import { Queue } from 'bullmq';

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

if (!redisHost) throw new Error('Cannot find REDIS_HOST from .env!');
if (!redisPort) throw new Error('Cannot find REDIS_PORT from .env!');

const connection = {
  host: redisHost,
  port: parseInt(redisPort),
};

export const notificationQueue = new Queue('notificationQueue', { connection });
