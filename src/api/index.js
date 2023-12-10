const express = require('express');
const limiter = require('../rateLimiterRedis');
const emojis = require('./emojis');

const router = express.Router();

router.use(limiter.rateLimiterMiddlewareAPI);

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);

module.exports = router;
