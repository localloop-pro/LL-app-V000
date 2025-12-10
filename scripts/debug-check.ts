import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env');

const SESSION_ID = 'debug-session';
const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/e09e4c60-ee9c-4c83-9bd9-aeed49280a4e';

async function log(message: string, data?: any, hypothesisId?: string) {
  try {
    await fetch(SERVER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'scripts/debug-check.ts',
        message,
        data,
        timestamp: Date.now(),
        sessionId: SESSION_ID,
        hypothesisId
      })
    });
  } catch (e) {
    console.error('Failed to log:', e);
  }
}

async function main() {
  await log('Starting debug check', {}, 'init');

  // Check .env
  if (!fs.existsSync(ENV_FILE)) {
    await log('.env file missing', {}, 'H1'); // Hypothesis 1: .env missing
    console.log('.env file missing');
    return;
  }

  await log('.env file exists', {}, 'H1');

  // Parse .env
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const envVars: Record<string, string> = {};
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envVars[key] = valueParts.join('=');
      }
    }
  });

  const keys = Object.keys(envVars);
  await log('Parsed env vars', { keys }, 'H2'); // Hypothesis 2: Env vars missing

  const postgresUrl = envVars['POSTGRES_URL'];
  if (!postgresUrl) {
    await log('POSTGRES_URL missing', {}, 'H2');
    console.log('POSTGRES_URL missing');
  } else {
    // Check DB connection
    try {
        const sql = postgres(postgresUrl, { connect_timeout: 5 });
        await log('Attempting DB connection', {}, 'H3'); // Hypothesis 3: DB unreachable
        const result = await sql`SELECT 1 as ping`;
        await log('DB connection successful', { result }, 'H3');
        await sql.end();
    } catch (error: any) {
        await log('DB connection failed', { error: error.message }, 'H3');
    }
  }
  
  // Check Better Auth Secret
  if (!envVars['BETTER_AUTH_SECRET']) {
     await log('BETTER_AUTH_SECRET missing', {}, 'H4');
  } else {
     await log('BETTER_AUTH_SECRET present', {}, 'H4');
  }

  // Check Google Client ID
  if (!envVars['GOOGLE_CLIENT_ID'] || envVars['GOOGLE_CLIENT_ID'].trim() === '') {
     await log('GOOGLE_CLIENT_ID missing or empty', {}, 'H5');
  } else {
     await log('GOOGLE_CLIENT_ID present', {}, 'H5');
  }
}

main().catch(console.error);

