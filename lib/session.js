import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error('SESSION_SECRET env var is not set');

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, storedHash) {
  // Altes SHA256-Format erkennen und automatisch auf bcrypt migrieren
  if (/^[a-f0-9]{64}$/.test(storedHash)) {
    const oldHash = crypto.createHash('sha256').update(`riq:${password}:2026`).digest('hex');
    return oldHash === storedHash ? 'legacy' : false;
  }
  return (await bcrypt.compare(password, storedHash)) ? 'ok' : false;
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
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
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
  return `riq_session=${encodeURIComponent(token)}; HttpOnly; Secure; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Strict`;
}

export function clearCookie() {
  return 'riq_session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict';
}

export function createConfirmToken(reservationId, action) {
  const expiry = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = `${reservationId}:${action}:${expiry}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${expiry}.${sig}`;
}

export function verifyConfirmToken(token, reservationId, action) {
  if (!token || !reservationId || !action) return false;
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (Date.now() > parseInt(expiry, 10)) return false;
  const payload = `${reservationId}:${action}:${expiry}`;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}
