import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'avteknikk.com',
  user: 'avteknikk_comledcalc',
  password: '@CalcLED24',
  database: 'avteknikk_comledcalc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/ledcalc/status', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'connected' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/ledcalc/panels', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM panels');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch panels' });
  }
});

app.post('/api/ledcalc/panels', async (req, res) => {
  try {
    const panel = req.body;
    const [result] = await pool.query(
      'INSERT INTO panels SET ?',
      panel
    );
    res.json({ ...panel, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save panel' });
  }
});

app.delete('/api/ledcalc/panels/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM panels WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete panel' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});