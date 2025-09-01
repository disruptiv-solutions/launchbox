
import { NextRequest } from 'next/server';

/**
 * ─────────────────────────── LEAD CAPTURE API ROUTE ───────────────────────────
 * This endpoint receives form submissions from your landing page and forwards
 * them to Make.com (or another webhook service). It includes basic spam filtering
 * via a honeypot field.
 *
 * Usage:
 * - Set MAKE_WEBHOOK_URL in your environment (.env.local or Secrets)
 * - The honeypot field ('hp') should be empty for legitimate submissions
 * - All other form data gets forwarded to your webhook
 * ─────────────────────────────────────────────────────────────────────────────
 */

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const body = await request.json();
    const { hp, ...lead } = body;

    // 1) Honeypot check: if 'hp' has any value, it's likely a bot
    if (hp && hp.trim()) {
      // Silently succeed (don't let bots know they were caught)
      return Response.json({ ok: true });
    }

    // 2) Basic server-side validation (optional but recommended)
    if (!lead.name?.trim() || !lead.email?.trim()) {
      return Response.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return Response.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // 3) Forward to your webhook (Make.com, Zapier, etc.)
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      // In development, you might want to just log and succeed
      console.log('Lead submission (no webhook configured):', lead);
      return Response.json({ ok: true });
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead,
        meta: {
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown',
          // Add more metadata as needed
        },
      }),
    });

    if (!webhookResponse.ok) {
      const text = await webhookResponse.text().catch(() => '');
      return Response.json(
        { error: 'Webhook failed', details: text.slice(0, 500) },
        { status: 502 }
      );
    }

    // Success! Keep the response small—client just needs to know it worked.
    return Response.json({ ok: true });
  } catch (err) {
    // Don't leak implementation details in production errors.
    // Log server-side if you need diagnostics (e.g., Sentry/Logflare).
    console.error('Lead API error:', err);
    return Response.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}

/**
 * ─────────────────────────── OPTIONAL ENHANCEMENTS ───────────────────────────
 * - Rate limiting: Add a tiny in-memory or kv-based counter keyed by IP (or
 *   better: use a library like upstash/ratelimit when deploying on Vercel)
 * - CORS headers: If you need to accept submissions from other domains
 * - Request logging: Track submission patterns for analytics
 * - Email validation: Use a service like ZeroBounce for deeper email verification
 * - Duplicate detection: Check if this email was recently submitted
 * ─────────────────────────────────────────────────────────────────────────────
 */
