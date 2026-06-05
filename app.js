const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const client = require('prom-client');
const { connectRedis } = require('./src/middleware/cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'product_service_requests_total',
  help: 'Total requests to product service',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const cacheHitCounter = new client.Counter({
  name: 'product_service_cache_hits_total',
  help: 'Total cache hits',
  registers: [register]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Connect Redis
connectRedis().catch(err => console.log('Redis connection failed:', err));

// Routes
app.use('/api/products', require('./src/routes/products'));

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'product-service',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});