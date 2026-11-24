import { Router } from 'express';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO = process.env.CONTACT_TO;
const CONTACT_FROM = process.env.CONTACT_FROM ?? 'Portfolio <contacto@casq89.com>';

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: at most 5 messages per IP per hour.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const recentSends = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const sends = (recentSends.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (sends.length >= RATE_LIMIT) {
    recentSends.set(ip, sends);
    return true;
  }
  sends.push(now);
  recentSends.set(ip, sends);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, sends] of recentSends) {
    if (sends.every((t) => now - t >= RATE_WINDOW_MS)) recentSends.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

function parsePayload(body: unknown): ContactPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const { name, email, message } = body as Record<string, unknown>;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') return null;

  const payload = { name: name.trim(), email: email.trim(), message: message.trim() };
  if (!payload.name || !payload.message || !EMAIL_PATTERN.test(payload.email)) return null;
  if (
    payload.name.length > LIMITS.name ||
    payload.email.length > LIMITS.email ||
    payload.message.length > LIMITS.message
  ) {
    return null;
  }
  return payload;
}

async function sendEmail({ name, email, message }: ContactPayload): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: email,
      subject: `Portfolio contact: ${name.replace(/[\r\n]+/g, ' ')}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }
}

export const contactRouter = Router();

contactRouter.post('/', async (req, res) => {
  // Honeypot: real users never fill the hidden "website" field.
  if (typeof req.body?.website === 'string' && req.body.website !== '') {
    res.json({ ok: true });
    return;
  }

  const payload = parsePayload(req.body);
  if (!payload) {
    res.status(400).json({ error: 'invalid_payload' });
    return;
  }

  if (isRateLimited(req.ip ?? 'unknown')) {
    res.status(429).json({ error: 'too_many_requests' });
    return;
  }

  if (!RESEND_API_KEY || !CONTACT_TO) {
    console.error('Contact form is not configured: set RESEND_API_KEY and CONTACT_TO');
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  try {
    await sendEmail(payload);
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to send contact email:', error);
    res.status(502).json({ error: 'send_failed' });
  }
});
