// pages/api/lead.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  WHAT THIS FILE DOES
 *  - Receives form submissions from the frontend (POST /api/lead).
 *  - Filters basic spam using a honeypot field (hp).
 *  - For valid requests, forwards the payload to a Make.com webhook.
 *  - Responds with JSON so the client can show success/failure UI.
 *
 *  QUICK START (Make.com + Next.js)
 *  1) In Make.com:
 *     - Create a Scenario ➜ "Webhooks" ➜ "Custom webhook".
 *     - Copy the generated webhook URL.
 *     - Click “Redetermine data structure” (you’ll trigger a test below).
 *
 *  2) In your project:
 *     - Create `.env.local` at the repo root and add:
 *         MAKE_WEBHOOK_URL=https://hook.make.com/your-webhook-id
 *     - Restart `next dev` so env vars load.
 *
 *  3) Test locally:
 *     curl -X POST http://localhost:3000/api/lead \
 *       -H "Content-Type: application/json" \
 *       -d '{"name":"Test User","email":"test@example.com","message":"Hello!"}'
 *
 *  4) In Make.com:
 *     - After the first successful request, map `payload.lead.*` and `payload.meta.*`
 *       into your email/CRM/Sheets modules.
 *
 *  WHY AN API ROUTE (vs posting directly to Make)?
 *  - Keeps your webhook URL secret (not exposed in client bundle).
 *  - Lets you add validation, rate limiting, logging, auth, etc.
 *  - You can keep the form UI unchanged even if your backend integrations evolve.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL; // Set in .env.local

// Optional: allow-list origins for extra safety (uncomment to use)
// const ALLOWED_ORIGINS = ['https://yourdomain.com', 'http://localhost:3000'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST (HTML forms and fetch() should post here)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Optional: origin allow-list check (basic CSRF hardening for cross-site posts)
  // const origin = req.headers.origin;
  // if (origin && !ALLOWED_ORIGINS.includes(origin)) {
  //   return res.status(403).json({ error: 'Forbidden origin' });
  // }

  if (!MAKE_WEBHOOK_URL) {
    // If you see this in dev, you likely forgot to add MAKE_WEBHOOK_URL to .env.local
    // and restart the dev server.
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    // Body is automatically parsed by Next.js API routes when content-type is JSON.
    // If you accept form-encoded bodies, you’d need custom parsing middleware.
    const { name, email, phone, company, message, marketingOk, hp } = req.body ?? {};

    // ─── Anti-spam honeypot ───────────────────────────────────────────────────
    // The frontend renders a visually-hidden text input named "hp".
    // Real users never fill it, but many bots do. If it's present, we silently
    // return a 200 so we don't tip bots off that we're ignoring them.
    if (hp) return res.status(200).json({ ok: true });

    // ─── Minimal validation (do the strict checks you need here) ──────────────
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Optional: stronger checks, e.g. regex for emails, message length, etc.

    // ─── Useful request metadata to send to Make (nice for ops/auditing) ──────
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      null;

    const payload = {
      lead: {
        name: String(name ?? ''),
        email: String(email ?? ''),
        phone: phone ? String(phone) : null,
        company: company ? String(company) : null,
        message: message ? String(message) : null,
        marketingOk: !!marketingOk,
      },
      meta: {
        ip,
        userAgent: req.headers['user-agent'] ?? null,
        referer: (req.headers.referer as string) ?? null,
        submittedAt: new Date().toISOString(),
        path: req.url,
        // You can add more: campaignId, pageId, AB variant, etc.
      },
    };

    // ─── Forward to Make.com ──────────────────────────────────────────────────
    // In your Make scenario, start with the Custom Webhook module, then branch:
    // - Send an internal notification email (to you/your team)
    // - Auto-reply to the lead
    // - Add a row to Google Sheets / create a CRM contact
    const r = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Note: If Make returns non-2xx, we bubble that up to the client (502).
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res
        .status(502)
        .json({ error: 'Make webhook failed', details: text.slice(0, 500) });
    }

    // Success! Keep the response small—client just needs to know it worked.
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Don’t leak implementation details in production errors.
    // Log server-side if you need diagnostics (e.g., Sentry/Logflare).
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}

/**
 * ─────────────────────────── OPTIONAL ENHANCEMENTS ───────────────────────────
 * - Rate limiting: Add a tiny in-memory or kv-based counter keyed by IP (or
 *   better: use a library like upstash/ratelimit when deploying on Vercel).
 *
 * - CAPTCHA: For high-volume forms, pair the honeypot with hCaptcha/Turnstile.
 *
 * - Schema validation: Use zod or yup to strictly validate/transform input.
 *   Example:
 *     const schema = z.object({ name: z.string().min(1), email: z.string().email(), ... })
 *     const lead = schema.parse(req.body)
 *
 * - Observability: Add server logs or Sentry to trace failures from Make.
 *
 * - Security: Never expose MAKE_WEBHOOK_URL to the client. If you truly need
 *   client → Make (demo only), use a public env var (NEXT_PUBLIC_*) and accept
 *   the risk of abuse; prefer this API proxy instead.
 * ──────────────────────────────────────────────────────────────────────────────
 */
