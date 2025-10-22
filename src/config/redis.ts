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

// Cache helper functions with graceful error handling
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    console.error('Redis cacheGet error:', error);
    return null; // Return null if Redis is unavailable
  }
};

export const cacheSet = async (
  key: string,
  value: string,
  expiresInSeconds?: number
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (expiresInSeconds) {
      await client.set(key, value, 'EX', expiresInSeconds);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    console.error('Redis cacheSet error:', error);
    // Silently fail - caching is not critical
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Redis cacheDel error:', error);
    // Silently fail - cache deletion is not critical
  }
};

export const cacheExists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis cacheExists error:', error);
    return false; // Return false if Redis is unavailable
  }
};
