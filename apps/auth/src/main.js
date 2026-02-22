
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users(email,password) VALUES($1,$2) ON CONFLICT DO NOTHING',
    [email, hash]
  );
  res.json({ message: 'registered' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!user.rows.length) return res.status(401).json({ error: 'invalid' });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ error: 'invalid' });

  const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
  res.json({ accessToken: token });
});

app.listen(3001, () => console.log('Auth running'));
