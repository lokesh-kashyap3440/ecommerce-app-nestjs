const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// Minimal Swagger definition (auto‑generated UI)
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'E‑commerce API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { 200: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login and obtain JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { 200: { description: 'JWT token' } },
      },
    },
    '/products': {
      get: { summary: 'List all products', responses: { 200: { description: 'Array of products' } } },
      post: { summary: 'Create a product', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } }, required: ['name', 'price'] } } } }, responses: { 200: { description: 'Created product' } } },
    },
    '/orders': {
      post: {
        summary: 'Create an order (JWT required)',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'integer' }, quantity: { type: 'integer' } }, required: ['productId', 'quantity'] } } } },
        responses: { 200: { description: 'Created order' } },
      },
    },
  },
};

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'missing token' });
  try {
    jwt.verify(header.split(' ')[1], 'supersecret');
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

app.use('/auth', (req, res) =>
  axios({ method: req.method, url: 'http://auth:3001' + req.url, data: req.body })
    .then(r => res.json(r.data))
    .catch(() => res.status(500).json({ error: 'auth error' }))
);

app.use('/products', (req, res) =>
  axios({ method: req.method, url: 'http://product:3002' + req.url, data: req.body })
    .then(r => res.json(r.data))
    .catch(() => res.status(500).json({ error: 'product error' }))
);

app.use('/orders', auth, (req, res) =>
  axios({ method: req.method, url: 'http://order:3003' + req.url, data: req.body })
    .then(r => res.json(r.data))
    .catch(() => res.status(500).json({ error: 'order error' }))
);

app.listen(3000, () => console.log('Gateway running'));
