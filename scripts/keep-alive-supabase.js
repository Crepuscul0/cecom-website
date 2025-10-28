#!/usr/bin/env node
/**
 * Keep-alive script for Supabase Postgres.
 *
 * This script executes a lightweight query against the database so that Supabase
 * registers recent activity and does not suspend the project for inactivity.
 *
 * Usage:
 *   node scripts/keep-alive-supabase.js
 *
 * Environment variables:
 *   SUPABASE_DATABASE_URL / DATABASE_URL  Connection string for Supabase Postgres
 *   KEEP_ALIVE_QUERY                      Optional custom SQL query (defaults to `select 1`)
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Client } = require('pg');

// Load environment variables, preferring `.env.local` (Next.js convention) and falling back to `.env`.
const envCandidates = ['.env.local', '.env'];
envCandidates.forEach((file) => {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
});

async function keepAlive() {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('[keep-alive] Error: No database connection string found.');
    console.error(
      '[keep-alive] Please set SUPABASE_DATABASE_URL (preferred) or DATABASE_URL in your environment.'
    );
    process.exitCode = 1;
    return;
  }

  const query = process.env.KEEP_ALIVE_QUERY || 'select 1';

  const client = new Client({
    connectionString,
    application_name: 'cecom-keep-alive-script',
    connectionTimeoutMillis: 5000,
  });

  try {
    const start = Date.now();
    console.log(`[keep-alive] ${new Date().toISOString()} Connecting to database...`);
    await client.connect();
    await client.query(query);
    const duration = Date.now() - start;
    console.log(
      `[keep-alive] ${new Date().toISOString()} Ping succeeded (query: \`${query}\`, ${duration}ms).`
    );
  } catch (error) {
    console.error('[keep-alive] Failed to execute keep-alive query:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch (err) {
      console.error('[keep-alive] Failed to close database connection cleanly:', err.message);
    }
  }
}

keepAlive();
