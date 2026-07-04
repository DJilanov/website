import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env'), override: false });

const requestsBackend = (process.env.REQUESTS_BACKEND || 'remote-api').toLowerCase();
const useRemoteApi = requestsBackend !== 'postgres';
const jilanovApiBase = (process.env.JILANOV_API_BASE || process.env.REMOTE_API_BASE || 'https://admin.jilanov.com/api').replace(/\/+$/, '');
const remoteContactEndpoint = process.env.JILANOV_CONTACT_ENDPOINT || '/store/contact';
const remoteAnalyticsEndpoint = process.env.JILANOV_ANALYTICS_ENDPOINT || '/store/analytics/events';
const remoteAdminRequestsEndpoint = process.env.JILANOV_ADMIN_REQUESTS_ENDPOINT || '/admin/ecommerce/contact-messages';
const remoteLoginEndpoint = process.env.JILANOV_LOGIN_ENDPOINT || '/auth/login';
const storeAnalyticsCategory = process.env.JILANOV_ANALYTICS_CATEGORY || 'software-development';
const storeRequestSource = process.env.JILANOV_STORE_REQUEST_SOURCE || 'software-lead';
const jilanovAdminUrl = (process.env.JILANOV_ADMIN_URL || 'https://admin.jilanov.com').replace(/\/+$/, '');
const euApiEnvPath = process.env.EU_API_ENV_PATH || '/Users/dimitarjilanov/work/test/EU/boilerplate/api/.env';
if (!useRemoteApi) {
  await loadSelectedEuEnvironment(euApiEnvPath);
}

const dataDir = path.join(rootDir, 'data');
const eventsFile = path.join(dataDir, 'events.jsonl');
const leadsFile = path.join(dataDir, 'leads.jsonl');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 5173);
const contactRecipient = process.env.CONTACT_TO_EMAIL || 'dimitar@jilanov.com';
const adminEmail = (process.env.ADMIN_EMAIL || 'toni-website@jilanov.com').trim().toLowerCase();
const adminSecret = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const cookieName = 'jilanov_admin';
const tablePrefix = useRemoteApi ? '' : await resolveTablePrefix(euApiEnvPath);
const storeRequestsTable = useRemoteApi ? 'remote:admin/ecommerce/contact-messages' : `${tablePrefix}store_contact_requests`;
const usersTable = `${tablePrefix}users`;
const dbPool = useRemoteApi ? null : createDbPool();
const mailTransport = useRemoteApi ? null : createMailTransport();
const adminSessions = new Map();
let dbInitialized = false;
let dbInitPromise = null;
let lastDbError = null;
if (dbPool) {
  dbPool.on('error', (error) => {
    lastDbError = error;
    console.warn(`Postgres pool error: ${errorMessage(error)}`);
  });
}
const allowedEventTypes = new Set([
  'page_view',
  'scroll_depth',
  'engagement_time',
  'cta_click',
  'lead_submit'
]);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

await fs.mkdir(dataDir, { recursive: true });
if (dbPool) {
  await ensureDb().catch((error) => {
    console.warn(`Store request database is not ready: ${errorMessage(error)}`);
  });
}

async function loadSelectedEuEnvironment(envPath) {
  const selectedKeys = new Set([
    'CLIENT_CONFIG_PATH',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USERNAME',
    'DB_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'SMTP_REPLY_TO'
  ]);

  const env = await readEnvFile(envPath);
  for (const [key, value] of Object.entries(env)) {
    if (selectedKeys.has(key) && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function readEnvFile(envPath) {
  try {
    const text = await fs.readFile(envPath, 'utf8');
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          const key = line.slice(0, index).trim();
          const raw = line.slice(index + 1).trim();
          const value = raw.replace(/^['"]|['"]$/g, '');
          return [key, value];
        })
        .filter(([key]) => key)
    );
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function resolveTablePrefix(envPath) {
  if (process.env.DB_TABLE_PREFIX !== undefined) return process.env.DB_TABLE_PREFIX;

  const clientConfigPath = process.env.CLIENT_CONFIG_PATH;
  if (!clientConfigPath) return '';

  const baseDir = process.env.CLIENT_CONFIG_BASE_DIR || path.dirname(envPath);
  const resolvedConfigPath = path.isAbsolute(clientConfigPath)
    ? clientConfigPath
    : path.resolve(baseDir, clientConfigPath);

  try {
    const config = JSON.parse(await fs.readFile(resolvedConfigPath, 'utf8'));
    return sanitizeIdentifierPart(config?.database?.tablePrefix || '');
  } catch (error) {
    console.warn(`Could not read EU client config for table prefix: ${errorMessage(error)}`);
    return '';
  }
}

function sanitizeIdentifierPart(value) {
  const text = String(value || '');
  if (!/^[A-Za-z0-9_]*$/.test(text)) {
    throw new Error(`Unsafe database identifier part: ${text}`);
  }
  return text;
}

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe database identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

function createDbPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 8,
      connectionTimeoutMillis: 2500,
      idleTimeoutMillis: 30000
    });
  }

  if (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USERNAME) {
    return null;
  }

  return new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 8,
    connectionTimeoutMillis: 2500,
    idleTimeoutMillis: 30000
  });
}

function createMailTransport() {
  if (!process.env.SMTP_HOST) return null;

  const auth = process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    : undefined;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === '465',
    ...(auth ? { auth } : {})
  });
}

function errorMessage(error) {
  return error?.message || error?.code || error?.name || 'Unknown error';
}

function sanitizeString(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function sanitizeObject(input, maxKeys = 24) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  return Object.fromEntries(
    Object.entries(input)
      .slice(0, maxKeys)
      .map(([key, value]) => {
        const cleanKey = sanitizeString(key, 64);
        if (typeof value === 'number' && Number.isFinite(value)) return [cleanKey, value];
        if (typeof value === 'boolean') return [cleanKey, value];
        return [cleanKey, sanitizeString(String(value ?? ''), 350)];
      })
      .filter(([key]) => key)
  );
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return index === -1
          ? [part, '']
          : [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function createAdminSession(admin) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  adminSessions.set(sessionId, {
    ...admin,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  return sessionId;
}

function getAdminSession(req) {
  const sessionId = parseCookies(req.headers.cookie)[cookieName] || '';
  if (!sessionId) return null;
  const session = adminSessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionId);
    return null;
  }
  return { id: sessionId, ...session };
}

function hasAdminSession(req) {
  return Boolean(getAdminSession(req));
}

function requireAdmin(req, res, next) {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  req.adminSession = session;
  next();
}

function deviceFromUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return 'tablet';
  if (/mobile|iphone|android/.test(ua)) return 'mobile';
  return 'desktop';
}

function referrerDomain(referrer) {
  try {
    if (!referrer) return 'direct';
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

function clientIp(req) {
  const forwarded = sanitizeString(req.headers['x-forwarded-for'] || '', 120).split(',')[0];
  return forwarded || req.socket.remoteAddress || 'local';
}

function countryCodeFromHeaders(req) {
  const candidates = [
    req.headers['cf-ipcountry'],
    req.headers['x-vercel-ip-country'],
    req.headers['cloudfront-viewer-country'],
    req.headers['x-country-code'],
    req.headers['x-appengine-country']
  ];
  for (const raw of candidates) {
    const value = sanitizeString(Array.isArray(raw) ? raw[0] : raw || '', 8).toUpperCase();
    if (/^[A-Z]{2}$/.test(value) && value !== 'XX' && value !== 'T1') return value;
  }
  return '';
}

function visitorHash(req) {
  const ip = clientIp(req);
  const ua = sanitizeString(req.headers['user-agent'] || '', 500);
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || adminSecret;
  return crypto.createHash('sha256').update(`${day}:${ip}:${ua}:${salt}`).digest('hex').slice(0, 18);
}

function ipHash(req) {
  const ip = clientIp(req);
  const salt = process.env.ANALYTICS_SALT || adminSecret;
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}

async function ensureDb() {
  if (!dbPool) {
    throw new Error('Database is not configured. Set DATABASE_URL or EU DB_HOST/DB_NAME/DB_USERNAME/DB_PASSWORD.');
  }
  if (dbInitialized) return dbPool;
  if (!dbInitPromise) {
    dbInitPromise = createStoreRequestsTable()
      .then(() => {
        dbInitialized = true;
        lastDbError = null;
        return dbPool;
      })
      .catch((error) => {
        lastDbError = error;
        dbInitPromise = null;
        throw error;
      });
  }
  return dbInitPromise;
}

async function createStoreRequestsTable() {
  const table = quoteIdentifier(storeRequestsTable);
  await dbPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS ${table} (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      "status" varchar(32) NOT NULL DEFAULT 'new',
      "recipient_email" varchar(255) NOT NULL,
      "name" varchar(140) NOT NULL,
      "company" varchar(140),
      "email" varchar(180) NOT NULL,
      "phone" varchar(80),
      "package_name" varchar(120),
      "project_type" varchar(120),
      "budget" varchar(120),
      "timeline" varchar(120),
      "message" text NOT NULL,
      "source" varchar(120),
      "medium" varchar(120),
      "campaign" varchar(160),
      "term" varchar(160),
      "content" varchar(160),
      "referrer" text,
      "referrer_domain" varchar(160),
      "path" varchar(300),
      "title" varchar(180),
      "visitor_id" varchar(120),
      "server_visitor_id" varchar(120),
      "session_id" varchar(120),
      "language" varchar(80),
      "timezone" varchar(100),
      "screen" varchar(80),
      "device" varchar(40),
      "user_agent" text,
      "ip_hash" varchar(64),
      "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "email_status" varchar(32) NOT NULL DEFAULT 'pending'
    )
  `);
  await dbPool.query(`CREATE INDEX IF NOT EXISTS "IDX_${storeRequestsTable}_created_at" ON ${table} ("created_at")`);
  await dbPool.query(`CREATE INDEX IF NOT EXISTS "IDX_${storeRequestsTable}_status" ON ${table} ("status")`);
  await dbPool.query(`CREATE INDEX IF NOT EXISTS "IDX_${storeRequestsTable}_email" ON ${table} ("email")`);
  await dbPool.query(`CREATE INDEX IF NOT EXISTS "IDX_${storeRequestsTable}_source" ON ${table} ("source")`);
  await dbPool.query(`CREATE INDEX IF NOT EXISTS "IDX_${storeRequestsTable}_campaign" ON ${table} ("campaign")`);
}

function leadFromBody(body) {
  return {
    name: sanitizeString(body.name, 140),
    company: sanitizeString(body.company, 140),
    email: sanitizeString(body.email, 180),
    phone: sanitizeString(body.phone, 80),
    package: sanitizeString(body.package, 120),
    projectType: sanitizeString(body.projectType, 120),
    budget: sanitizeString(body.budget, 120),
    timeline: sanitizeString(body.timeline, 120),
    message: sanitizeString(body.message, 2500)
  };
}

function endpointUrl(endpoint, query = {}) {
  const url = new URL(endpoint.replace(/^\/+/, ''), `${jilanovApiBase}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function callRemoteApi(endpoint, { method = 'GET', token, body, query, headers = {} } = {}) {
  const response = await fetch(endpointUrl(endpoint, query), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { message: text };
        }
      })()
    : {};
  if (!response.ok) {
    const error = new Error(
      Array.isArray(data.message) ? data.message.join(', ') : data.message || response.statusText
    );
    error.statusCode = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function remoteContactPayload(event, lead) {
  const detailLines = [
    lead.company ? `Company: ${lead.company}` : null,
    lead.package ? `Preferred package: ${lead.package}` : null,
    lead.projectType ? `Project type: ${lead.projectType}` : null,
    lead.budget ? `Budget: ${lead.budget}` : null,
    lead.timeline ? `Desired start: ${lead.timeline}` : null,
    event.source ? `Source: ${event.source}` : null,
    event.medium ? `Medium: ${event.medium}` : null,
    event.campaign ? `Campaign: ${event.campaign}` : null,
    event.referrerDomain && event.referrerDomain !== 'direct' ? `Referrer: ${event.referrerDomain}` : null,
    event.path ? `Page: ${event.path}` : null
  ].filter(Boolean);

  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || undefined,
    message: [lead.message, detailLines.length ? `\n---\n${detailLines.join('\n')}` : ''].join('').slice(0, 5000),
    source: storeRequestSource,
    sourceUrl: event.path || '/',
    productContext: [lead.projectType, lead.package].filter(Boolean).join(' / ').slice(0, 160) || undefined,
    categoryContext: [event.source, event.campaign].filter(Boolean).join(' / ').slice(0, 120) || undefined,
    language: event.language?.slice(0, 12) || undefined
  };
}

function remoteAnalyticsType(type) {
  if (type === 'lead_submit') return 'software_lead_submit';
  return type;
}

function analyticsValue(event) {
  if (event.type === 'engagement_time') return Number(event.metadata?.seconds) || undefined;
  if (event.type === 'scroll_depth') return Number(event.metadata?.depth) || undefined;
  return undefined;
}

function remoteAnalyticsPayload(event) {
  return {
    type: remoteAnalyticsType(event.type),
    path: event.path || '/',
    locale: event.language ? event.language.split(/[-_]/)[0]?.slice(0, 12) : undefined,
    device: event.device || undefined,
    sessionId: event.sessionId || undefined,
    visitorId: event.visitorId || event.serverVisitorId || undefined,
    category: storeAnalyticsCategory,
    value: analyticsValue(event),
    metadata: {
      ...event.metadata,
      source: event.source || 'direct',
      medium: event.medium || undefined,
      campaign: event.campaign || undefined,
      term: event.term || undefined,
      content: event.content || undefined,
      referrer: event.referrer || undefined,
      referrerDomain: event.referrerDomain || undefined,
      ipHash: event.ipHash || undefined,
      countryCode: event.countryCode || undefined,
      title: event.title || undefined,
      timezone: event.timezone || undefined,
      screen: event.screen || undefined
    }
  };
}

async function forwardStoreAnalyticsEvent(event) {
  if (!useRemoteApi) return;
  try {
    await callRemoteApi(remoteAnalyticsEndpoint, {
      method: 'POST',
      body: { events: [remoteAnalyticsPayload(event)] }
    });
  } catch (error) {
    console.warn(`Store analytics forwarding failed: ${errorMessage(error)}`);
  }
}

async function saveRemoteStoreRequest(event, lead, req) {
  const ip = req ? clientIp(req) : '';
  await callRemoteApi(remoteContactEndpoint, {
    method: 'POST',
    body: remoteContactPayload(event, lead),
    headers: ip
      ? {
          'X-Forwarded-For': ip,
          'X-Real-IP': ip
        }
      : {}
  });
  return {
    id: event.id,
    timestamp: event.timestamp,
    source: storeRequestSource,
    status: 'new',
    recipientEmail: contactRecipient,
    emailStatus: 'remote-api',
    lead
  };
}

function remoteContactMessageToAdminLead(item) {
  return {
    id: item.id,
    timestamp: item.createdAt,
    source: item.source,
    status: item.leadStatus || 'new',
    recipientEmail: contactRecipient,
    emailStatus: 'remote-api',
    lead: {
      name: item.name,
      company: item.categoryContext || '',
      email: item.email,
      phone: item.phone || '',
      package: '',
      projectType: item.productContext || 'Software request',
      budget: '',
      timeline: item.followUpAt || '',
      message: item.message
    }
  };
}

async function listRemoteStoreRequests(limit = 100, session) {
  if (!session?.accessToken) {
    throw new Error('Remote admin session is missing an access token');
  }
  const data = await callRemoteApi(remoteAdminRequestsEndpoint, {
    token: session.accessToken,
    query: {
      limit,
      page: 1,
      search: storeRequestSource
    }
  });
  const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
  return items.map(remoteContactMessageToAdminLead);
}

function requestRowToAdminLead(row) {
  return {
    id: row.id,
    timestamp: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    referrerDomain: row.referrer_domain,
    status: row.status,
    recipientEmail: row.recipient_email,
    emailStatus: row.email_status,
    lead: {
      name: row.name,
      company: row.company,
      email: row.email,
      phone: row.phone,
      package: row.package_name,
      projectType: row.project_type,
      budget: row.budget,
      timeline: row.timeline,
      message: row.message
    }
  };
}

async function saveStoreRequest(event, lead, req) {
  if (useRemoteApi) {
    return saveRemoteStoreRequest(event, lead, req);
  }

  const db = await ensureDb();
  const table = quoteIdentifier(storeRequestsTable);
  const metadata = {
    ...event.metadata,
    contactRecipient,
    userAgent: sanitizeString(req.headers['user-agent'] || '', 500)
  };

  const result = await db.query(
    `
      INSERT INTO ${table} (
        "recipient_email", "name", "company", "email", "phone", "package_name", "project_type",
        "budget", "timeline", "message", "source", "medium", "campaign", "term", "content",
        "referrer", "referrer_domain", "path", "title", "visitor_id", "server_visitor_id",
        "session_id", "language", "timezone", "screen", "device", "user_agent", "ip_hash", "metadata"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28, $29::jsonb
      )
      RETURNING *
    `,
    [
      contactRecipient,
      lead.name,
      lead.company || null,
      lead.email,
      lead.phone || null,
      lead.package || null,
      lead.projectType || null,
      lead.budget || null,
      lead.timeline || null,
      lead.message,
      event.source || null,
      event.medium || null,
      event.campaign || null,
      event.term || null,
      event.content || null,
      event.referrer || null,
      event.referrerDomain || null,
      event.path || null,
      event.title || null,
      event.visitorId || null,
      event.serverVisitorId || null,
      event.sessionId || null,
      event.language || null,
      event.timezone || null,
      event.screen || null,
      event.device || null,
      sanitizeString(req.headers['user-agent'] || '', 500) || null,
      ipHash(req),
      JSON.stringify(metadata)
    ]
  );

  const row = result.rows[0];
  const emailStatus = await sendLeadNotification(row).catch((error) => {
    console.warn(`Lead notification failed: ${errorMessage(error)}`);
    return 'failed';
  });

  await db.query(
    `UPDATE ${table} SET "email_status" = $2, "updated_at" = now() WHERE "id" = $1`,
    [row.id, emailStatus]
  );

  row.email_status = emailStatus;
  return requestRowToAdminLead(row);
}

async function sendLeadNotification(row) {
  if (!mailTransport) return 'not_configured';

  const from = process.env.SMTP_FROM || contactRecipient;
  const subject = `Software request: ${row.name}${row.company ? ` / ${row.company}` : ''}`;
  const lines = [
    `Name: ${row.name}`,
    row.company ? `Company: ${row.company}` : null,
    `Email: ${row.email}`,
    row.phone ? `Phone: ${row.phone}` : null,
    row.package_name ? `Package: ${row.package_name}` : null,
    row.project_type ? `Project type: ${row.project_type}` : null,
    row.budget ? `Budget: ${row.budget}` : null,
    row.timeline ? `Timeline: ${row.timeline}` : null,
    row.source ? `Source: ${row.source}` : null,
    row.campaign ? `Campaign: ${row.campaign}` : null,
    '',
    row.message
  ].filter((line) => line !== null);

  await mailTransport.sendMail({
    from,
    to: contactRecipient,
    replyTo: row.email,
    subject,
    text: lines.join('\n'),
    html: `
      <h2>New software request</h2>
      <p><strong>${escapeHtml(row.name)}</strong>${row.company ? ` from ${escapeHtml(row.company)}` : ''}</p>
      <p><a href="mailto:${escapeHtml(row.email)}">${escapeHtml(row.email)}</a>${row.phone ? ` / ${escapeHtml(row.phone)}` : ''}</p>
      <p><strong>Project:</strong> ${escapeHtml(row.project_type || 'Not specified')} / ${escapeHtml(row.budget || 'Budget not specified')} / ${escapeHtml(row.timeline || 'Timeline not specified')}</p>
      <p><strong>Source:</strong> ${escapeHtml(row.source || 'direct')}${row.campaign ? ` / ${escapeHtml(row.campaign)}` : ''}</p>
      <p style="white-space:pre-line">${escapeHtml(row.message)}</p>
    `
  });

  return 'sent';
}

async function listStoreRequests(limit = 100, session = null) {
  if (useRemoteApi) {
    return listRemoteStoreRequests(limit, session);
  }

  const db = await ensureDb();
  const table = quoteIdentifier(storeRequestsTable);
  const result = await db.query(
    `SELECT * FROM ${table} ORDER BY "created_at" DESC LIMIT $1`,
    [Math.max(1, Math.min(500, Number(limit) || 100))]
  );
  return result.rows.map(requestRowToAdminLead);
}

async function countStoreRequests(days) {
  if (useRemoteApi) {
    return 0;
  }

  const db = await ensureDb();
  const table = quoteIdentifier(storeRequestsTable);
  const result = await db.query(
    `SELECT count(*)::int AS total FROM ${table} WHERE "created_at" >= now() - ($1::int * interval '1 day')`,
    [days]
  );
  return Number(result.rows[0]?.total || 0);
}

async function verifyRemoteAdminCredentials(email, password) {
  const cleanEmail = sanitizeString(email, 255).toLowerCase();
  if (cleanEmail !== adminEmail) return null;
  if (!password) return null;

  const data = await callRemoteApi(remoteLoginEndpoint, {
    method: 'POST',
    body: {
      email: cleanEmail,
      password: String(password)
    }
  });

  if (data.requiresMfa) {
    const error = new Error('MFA is enabled for this account. Use the main admin panel for MFA login.');
    error.statusCode = 403;
    throw error;
  }

  if (!data.accessToken) {
    throw new Error('Remote login did not return an access token');
  }

  return {
    email: cleanEmail,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken || null,
    remoteExpiresAt: Date.now() + Number(data.expiresIn || 900) * 1000
  };
}

async function verifyAdminCredentials(email, password) {
  if (useRemoteApi) {
    return verifyRemoteAdminCredentials(email, password);
  }

  const cleanEmail = sanitizeString(email, 255).toLowerCase();
  if (cleanEmail !== adminEmail) return null;
  if (!password) return null;

  const db = await ensureDb();
  const table = quoteIdentifier(usersTable);
  const result = await db.query(
    `SELECT "id", "email", "passwordHash", "isActive", "lockedUntil", "mfaEnabled"
     FROM ${table}
     WHERE lower("email") = lower($1)
     LIMIT 1`,
    [cleanEmail]
  );
  const user = result.rows[0];
  if (!user || !user.isActive) return null;
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    const error = new Error('Account is temporarily locked');
    error.statusCode = 423;
    throw error;
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash || '');
  if (!valid) {
    await db.query(
      `UPDATE ${table}
       SET "failedLoginAttempts" = COALESCE("failedLoginAttempts", 0) + 1,
           "lockedUntil" = CASE
             WHEN COALESCE("failedLoginAttempts", 0) + 1 >= 5 THEN now() + interval '15 minutes'
             ELSE "lockedUntil"
           END
       WHERE "id" = $1`,
      [user.id]
    ).catch(() => undefined);
    return null;
  }

  if (user.mfaEnabled) {
    const error = new Error('MFA is enabled for this account. Use the EU admin auth flow.');
    error.statusCode = 403;
    throw error;
  }

  await db.query(
    `UPDATE ${table} SET "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE "id" = $1`,
    [user.id]
  ).catch(() => undefined);

  return { id: user.id, email: user.email };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function appendJsonLine(file, value) {
  await fs.appendFile(file, `${JSON.stringify(value)}\n`, 'utf8');
}

async function readJsonLines(file) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return text
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function collectBaseEvent(req, body) {
  const referrer = sanitizeString(body.referrer, 800);
  const utm = sanitizeObject(body.utm || {}, 12);
  const source = sanitizeString(utm.utm_source || body.source || '', 120);
  return {
    id: crypto.randomUUID(),
    type: sanitizeString(body.type, 60),
    timestamp: new Date().toISOString(),
    visitorId: sanitizeString(body.visitorId, 120) || visitorHash(req),
    serverVisitorId: visitorHash(req),
    sessionId: sanitizeString(body.sessionId, 120),
    path: sanitizeString(body.path, 300) || '/',
    title: sanitizeString(body.title, 180),
    referrer,
    referrerDomain: referrerDomain(referrer),
    source: source || referrerDomain(referrer),
    medium: sanitizeString(utm.utm_medium || body.medium || '', 120),
    campaign: sanitizeString(utm.utm_campaign || body.campaign || '', 160),
    term: sanitizeString(utm.utm_term || '', 160),
    content: sanitizeString(utm.utm_content || '', 160),
    language: sanitizeString(body.language, 80),
    timezone: sanitizeString(body.timezone, 100),
    screen: sanitizeString(body.screen, 80),
    device: deviceFromUserAgent(req.headers['user-agent'] || ''),
    ipHash: ipHash(req),
    countryCode: countryCodeFromHeaders(req),
    metadata: sanitizeObject(body.metadata || {}, 32)
  };
}

function increment(map, key, amount = 1) {
  const name = sanitizeString(key || 'unknown', 160) || 'unknown';
  map.set(name, (map.get(name) || 0) + amount);
}

function topFromMap(map, limit = 10) {
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function analyticsFor(events, days = 30) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const scoped = events.filter((event) => Date.parse(event.timestamp) >= since);
  const visitors = new Set(scoped.map((event) => event.visitorId || event.serverVisitorId).filter(Boolean));
  const sessions = new Set(scoped.map((event) => event.sessionId).filter(Boolean));
  const pageViews = scoped.filter((event) => event.type === 'page_view');
  const leads = scoped.filter((event) => event.type === 'lead_submit');
  const engagement = scoped.filter((event) => event.type === 'engagement_time');

  const source = new Map();
  const referrer = new Map();
  const paths = new Map();
  const devices = new Map();
  const timezones = new Map();
  const languages = new Map();
  const clicks = new Map();
  const campaigns = new Map();
  const timeBySource = new Map();
  const depthByPath = new Map();
  const daily = new Map();

  for (const event of scoped) {
    const day = String(event.timestamp || '').slice(0, 10);
    if (day) increment(daily, day);
    increment(devices, event.device || 'unknown');
    if (event.timezone) increment(timezones, event.timezone);
    if (event.language) increment(languages, event.language);
    if (event.type === 'page_view') {
      increment(source, event.source || 'direct');
      increment(referrer, event.referrerDomain || 'direct');
      increment(paths, event.path || '/');
      if (event.campaign) increment(campaigns, event.campaign);
    }
    if (event.type === 'cta_click') increment(clicks, event.metadata?.label || event.metadata?.href || 'click');
    if (event.type === 'engagement_time') {
      increment(timeBySource, event.source || 'direct', Number(event.metadata?.seconds || 0));
    }
    if (event.type === 'scroll_depth') {
      const existing = depthByPath.get(event.path) || 0;
      depthByPath.set(event.path || '/', Math.max(existing, Number(event.metadata?.depth || 0)));
    }
  }

  const engagementSeconds = engagement.reduce((sum, event) => sum + Number(event.metadata?.seconds || 0), 0);
  const maxScrollDepth = Math.max(0, ...scoped.map((event) => Number(event.metadata?.depth || 0)));

  return {
    windowDays: days,
    generatedAt: new Date().toISOString(),
    totals: {
      visitors: visitors.size,
      sessions: sessions.size || visitors.size,
      pageViews: pageViews.length,
      leads: leads.length,
      ctaClicks: scoped.filter((event) => event.type === 'cta_click').length,
      avgEngagementSeconds: visitors.size ? Math.round(engagementSeconds / visitors.size) : 0,
      maxScrollDepth
    },
    topSources: topFromMap(source),
    topReferrers: topFromMap(referrer),
    topPaths: topFromMap(paths),
    devices: topFromMap(devices),
    topTimezones: topFromMap(timezones),
    topLanguages: topFromMap(languages),
    topClicks: topFromMap(clicks),
    campaigns: topFromMap(campaigns),
    engagementBySource: topFromMap(timeBySource),
    scrollDepthByPath: topFromMap(depthByPath),
    daily: topFromMap(daily, 60).sort((a, b) => a.name.localeCompare(b.name)),
    recentEvents: scoped.slice(-80).reverse(),
    recentLeads: leads.slice(-20).reverse()
  };
}

app.post('/api/track', async (req, res) => {
  const event = collectBaseEvent(req, req.body || {});
  if (!allowedEventTypes.has(event.type)) {
    res.status(400).json({ error: 'Unsupported event type' });
    return;
  }

  await appendJsonLine(eventsFile, event);
  await forwardStoreAnalyticsEvent(event);
  res.status(204).end();
});

app.post('/api/leads', async (req, res) => {
  const body = req.body || {};
  const event = collectBaseEvent(req, {
    ...body,
    type: 'lead_submit',
    metadata: {
      package: body.package,
      projectType: body.projectType,
      budget: body.budget,
      timeline: body.timeline
    }
  });
  const lead = leadFromBody(body);

  if (!lead.name || !lead.email || !lead.message) {
    res.status(400).json({ error: 'Name, email and message are required.' });
    return;
  }

  try {
    const saved = await saveStoreRequest(event, lead, req);
    const analyticsLead = { ...event, lead, requestId: saved.id };
    await appendJsonLine(eventsFile, analyticsLead);
    await appendJsonLine(leadsFile, analyticsLead);
    await forwardStoreAnalyticsEvent(analyticsLead);
    res.status(201).json({ ok: true, id: saved.id, recipient: contactRecipient });
  } catch (error) {
    console.error(`Failed to save store request: ${errorMessage(error)}`);
    res.status(503).json({ error: 'The request could not be saved right now.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const admin = await verifyAdminCredentials(req.body?.email, req.body?.password);
    if (!admin) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const sessionId = createAdminSession(admin);
    res.setHeader(
      'Set-Cookie',
      `${cookieName}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProduction ? '; Secure' : ''}`
    );
    res.json({ ok: true, email: admin.email });
  } catch (error) {
    const status = error.statusCode || 503;
    res.status(status).json({ error: status === 503 ? 'Admin authentication is unavailable.' : errorMessage(error) });
  }
});

app.get('/api/admin/session', (req, res) => {
  const session = getAdminSession(req);
  res.json({
    authenticated: Boolean(session),
    adminEmail,
    requests: {
      backend: requestsBackend,
      apiBase: useRemoteApi ? jilanovApiBase : null,
      adminUrl: jilanovAdminUrl,
      analyticsCategory: storeAnalyticsCategory,
      requestSource: storeRequestSource,
      table: storeRequestsTable,
      lastError: lastDbError ? errorMessage(lastDbError) : null
    }
  });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  if (req.adminSession?.id) adminSessions.delete(req.adminSession.id);
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));
  const events = await readJsonLines(eventsFile);
  const leads = await readJsonLines(leadsFile);
  const payload = analyticsFor(events, days);
  try {
    payload.leads = await listStoreRequests(100, req.adminSession);
    payload.totals.leads = useRemoteApi
      ? payload.leads.filter((item) => Date.parse(item.timestamp) >= Date.now() - days * 24 * 60 * 60 * 1000).length
      : await countStoreRequests(days);
  } catch (error) {
    lastDbError = error;
    payload.leads = leads.slice(-100).reverse();
    payload.requestsWarning = errorMessage(error);
  }
  payload.adminEmail = adminEmail;
  payload.contactRecipient = contactRecipient;
  payload.requests = {
    backend: requestsBackend,
    apiBase: useRemoteApi ? jilanovApiBase : null,
    adminUrl: jilanovAdminUrl,
    analyticsCategory: storeAnalyticsCategory,
    requestSource: storeRequestSource,
    configured: useRemoteApi || Boolean(dbPool),
    table: storeRequestsTable,
    healthy: !lastDbError,
    lastError: lastDbError ? errorMessage(lastDbError) : null
  };
  res.json(payload);
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    requests: {
      backend: requestsBackend,
      apiBase: useRemoteApi ? jilanovApiBase : null,
      adminUrl: jilanovAdminUrl,
      analyticsCategory: storeAnalyticsCategory,
      requestSource: storeRequestSource,
      configured: useRemoteApi || Boolean(dbPool),
      table: storeRequestsTable,
      healthy: useRemoteApi ? !lastDbError : dbInitialized && !lastDbError,
      lastError: lastDbError ? errorMessage(lastDbError) : null
    }
  });
});

if (isProduction) {
  app.use(express.static(path.join(rootDir, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(rootDir, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Jilanov Engineering site running at http://localhost:${port}`);
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Contact recipient: ${contactRecipient}`);
  console.log(`EU admin: ${jilanovAdminUrl}/ecommerce/software-leads`);
  console.log(
    useRemoteApi
      ? `Requests backend: remote API (${jilanovApiBase})`
      : dbPool
      ? `Store requests table: ${storeRequestsTable}`
      : 'Store request database is not configured. Set DATABASE_URL or EU DB_* variables.'
  );
});
