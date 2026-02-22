
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = redis.createClient({ url: 'redis://' + process.env.REDIS_HOST + ':6379' });
client.connect();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'missing token' });
  try {
    jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}


app.get('/', async (req, res) => {
  const cached = await client.get('products');
  if (cached) return res.json(JSON.parse(cached));

  const result = await pool.query('SELECT * FROM products');
  await client.set('products', JSON.stringify(result.rows), { EX: 60 });
  res.json(result.rows);
});

app.post('/', auth, async (req, res) => {
  const { name, price } = req.body;
  const result = await pool.query(
    'INSERT INTO products(name,price) VALUES($1,$2) RETURNING *',
    [name, price]
  );
  await client.del('products');
  res.json(result.rows[0]);
});

app.listen(3002, () => console.log('Product running'));
