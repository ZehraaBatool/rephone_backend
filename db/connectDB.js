import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

// Test the connection to the database
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Database connection error:', err.stack));

export default pool;
