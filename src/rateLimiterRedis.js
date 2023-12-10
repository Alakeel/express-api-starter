const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

// It is recommended to process Redis errors and setup some reconnection strategy
const redis = new Redis({
  options: {
    enableOfflineQueue: false,
  },
});

// It is recommended to process Redis errors and setup some reconnection strategy
redis.on('error', (err) => {
  console.log('Redis Conn Error');
});

const optsAPI = {
  storeClient: redis,
  points: 2, // 10 requests
  duration: 1, // per 1 second by IP
  blockDuration: 2, // Do not block if consumed more than points
  // blockDuration: 60 * 60 * 24 * 5, // Do not block if consumed more than points
  keyPrefix: 'limiter-api', // must be unique for limiters with different purpose
  // inMemoryBlockOnConsumed: 300, // If userId or IP consume >=300 points per minute
  // inMemoryBlockDuration: 60, // Block it for a minute in memory, so no requests go to Redis
};

const optsWebsite = {
  storeClient: redis,
  points: 5, // 10 requests
  duration: 1, // per 1 second by IP
  blockDuration: 0, // Do not block if consumed more than points
  // blockDuration: 60 * 60 * 24 * 5, // Do not block if consumed more than points
  keyPrefix: 'limiter-web', // must be unique for limiters with different purpose
};


function formatRetryMessage(secs) {
  if (secs < 60) {
    return `Please wait for ${secs} seconds before trying again.`;
  } else if (secs < 3600) {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `Please wait for ${minutes} minutes and ${remainingSeconds} seconds before trying again.`;
  } else if (secs < 86400) {
    const hours = Math.floor(secs / 3600);
    const remainingMinutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;
    return `Please wait for ${hours} hours, ${remainingMinutes} minutes, and ${remainingSeconds} seconds before trying again.`;
  } else {
    const days = Math.floor(secs / 86400);
    const remainingHours = Math.floor((secs % 86400) / 3600);
    const remainingMinutes = Math.floor((secs % 3600) / 60);
    return `Please wait for ${days} days, ${remainingHours} hours, and ${remainingMinutes} minutes before trying again.`;
  }
}

const createRateLimiter = (opts) => new RateLimiterRedis(opts);

const rateLimiterMiddleware = (limiter, req, res, next) => {
  limiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        // Handle Redis error
        // Decide what to do with it
      } else {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).send(`Too Many Requests - ${formatRetryMessage(secs)}`);
      }
    });
};

const rateLimiterAPI = createRateLimiter(optsAPI);
const rateLimiterWebsite = createRateLimiter(optsWebsite);

const rateLimiterMiddlewareAPI = (req, res, next) => {
  rateLimiterMiddleware(rateLimiterAPI, req, res, next);
};

const rateLimiterMiddlewareWebsite = (req, res, next) => {
  rateLimiterMiddleware(rateLimiterWebsite, req, res, next);
};

module.exports = {
  rateLimiterMiddlewareAPI,
  rateLimiterMiddlewareWebsite,
};
