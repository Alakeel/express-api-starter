const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const limiter = require('./rateLimiterRedis');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(limiter.rateLimiterMiddlewareWebsite);
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);
// Example route that triggers an error
app.get('/err', (req, res, next) => {
  const error = new Error('Manual test error');
  next(error);
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
