const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => console.log('Redis error:', err));
  redisClient.on('connect', () => console.log('Redis connected'));

  await redisClient.connect();
};

const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    if (!redisClient) return next();

    const key = `products:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`Cache HIT: ${key}`);
        return res.json({
          ...JSON.parse(cached),
          fromCache: true
        });
      }
      console.log(`Cache MISS: ${key}`);

      // Override res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await redisClient.setEx(key, ttl, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.log('Cache error:', err);
      next();
    }
  };
};

const clearCache = async (pattern) => {
  if (!redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(keys);
    console.log(`Cache cleared: ${pattern}`);
  } catch (err) {
    console.log('Clear cache error:', err);
  }
};

module.exports = { connectRedis, cacheMiddleware, clearCache };