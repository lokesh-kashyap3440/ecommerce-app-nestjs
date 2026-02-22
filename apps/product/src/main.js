
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = redis.createClient({ url: 'redis://' + process.env.REDIS_HOST + ':6379' });
client.connect();

app.get('/', async (req, res) => {
  const cached = await client.get('products');
  if (cached) return res.json(JSON.parse(cached));

  const result = await pool.query('SELECT * FROM products');
  await client.set('products', JSON.stringify(result.rows), { EX: 60 });
  res.json(result.rows);
});

app.post('/', async (req, res) => {
  const { name, price } = req.body;
  const result = await pool.query(
    'INSERT INTO products(name,price) VALUES($1,$2) RETURNING *',
    [name, price]
  );
  await client.del('products');
  res.json(result.rows[0]);
});

app.listen(3002, () => console.log('Product running'));
