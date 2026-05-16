// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD in env (or .env) then run: npm run setup-admin
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../lib/db');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in environment before running this script.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
try {
  db.createOrUpdateAdmin(email, hash);
  console.log('Admin user created/updated:', email);
} catch (err) {
  console.error('Failed to create admin:', err.message);
}
