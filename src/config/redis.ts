import Redis from 'ioredis';
import { env } from './env';

// Redis Client singleton
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: false,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  return redisClient;
};

// Graceful shutdown
export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Health check
export const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  return await client.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  expiresInSeconds?: number
): Promise<void> => {
  const client = getRedisClient();
  if (expiresInSeconds) {
    await client.set(key, value, 'EX', expiresInSeconds);
  } else {
    await client.set(key, value);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = getRedisClient();
  await client.del(key);
};

export const cacheExists = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
};
