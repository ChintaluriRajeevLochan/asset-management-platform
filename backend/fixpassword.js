const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST, port: process.env.DB_PORT,
  database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
});

async function fix() {
  const hash = await bcrypt.hash('Admin@123', 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2',
    [hash, 'admin@iitroorkee.ac.in']);
  console.log('✅ Password updated!');
  process.exit();
}
fix();