/**
 * 🗄️ Database Connection Module
 * PostgreSQL connectie voor gebruikersprofielen en SMS notificaties
 */

import { Pool, PoolClient } from 'pg';

// Database configuratie
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kitebuddy',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum aantal connecties
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Database pool
let pool: Pool | null = null;

/**
 * 🔌 Initialiseer database connectie
 */
export function initializeDatabase(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Test connectie
    pool.on('connect', () => {
      console.log('✅ Database connected');
    });
    
    pool.on('error', (err) => {
      console.error('❌ Database error:', err);
    });
  }
  
  return pool;
}

/**
 * 🔗 Haal database pool op
 */
export function getPool(): Pool {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

/**
 * 🔄 Voer query uit met transactie
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 🔍 Voer eenvoudige query uit
 */
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * 🧹 Sluit database connectie
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Database connection closed');
  }
}

// Auto-close bij process exit
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});
