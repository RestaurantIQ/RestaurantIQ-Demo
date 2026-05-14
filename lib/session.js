import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'riq-fallback-secret-change-in-production';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(`riq:${password}:2026`).digest('hex');
}

export function createToken(payload) {
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('hex');
  return `${b64}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('hex');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSession(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;)\s*riq_session=([^;]+)/);
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

export function sessionCookie(token) {
  return `riq_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Strict`;
}

export function clearCookie() {
  return 'riq_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict';
}
