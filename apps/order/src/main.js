
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate product via product service
  const products = await axios.get('http://product:3002/');
  const product = products.data.find(p => p.id === productId);
  if (!product) return res.status(400).json({ error: 'invalid product' });

  const total = product.price * quantity;

  const result = await pool.query(
    'INSERT INTO orders(product_id,quantity,total) VALUES($1,$2,$3) RETURNING *',
    [productId, quantity, total]
  );

  res.json(result.rows[0]);
});

app.listen(3003, () => console.log('Order running'));
