
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

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
    .catch(e => res.status(500).json({ error: 'auth error' }))
);

app.use('/products', (req, res) =>
  axios({ method: req.method, url: 'http://product:3002' + req.url, data: req.body })
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json({ error: 'product error' }))
);

app.use('/orders', auth, (req, res) =>
  axios({ method: req.method, url: 'http://order:3003' + req.url, data: req.body })
    .then(r => res.json(r.data))
    .catch(e => res.status(500).json({ error: 'order error' }))
);

app.listen(3000, () => console.log('Gateway running'));
