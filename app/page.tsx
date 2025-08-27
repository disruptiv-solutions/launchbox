
'use client';

import { useState } from 'react';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  TEMPLATE NOTES
 *  - This is a reusable landing page + lead form built with Next.js + Tailwind.
 *  - The form posts to /api/lead (you'll create that API route) which forwards
 *    to your Make.com webhook. See comments in handleSubmit().
 *  - Includes a "honeypot" anti-spam field (named `hp`) to filter simple bots.
 * ──────────────────────────────────────────────────────────────────────────────
 */
const SITE = {
  name: 'Your Company',
  tagline: 'Build. Launch. Grow.',
  description:
    'We design AI-powered products and automations that help teams move faster, scale smarter, and delight customers.',
  contactEmail: 'info@yourcompany.com',
  phone: '+1 (234) 567-890',
  nav: [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  features: [
    {
      title: 'Lightning-fast setup',
      body: 'Go from idea to production in days, not months, with opinionated defaults.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M13 2a1 1 0 0 1 .894.553l7 14A1 1 0 0 1 20 18h-6.382l.724 3.618a1 1 0 0 1-1.772.86l-10-12A1 1 0 0 1 3.382 9H10l-.724-3.618A1 1 0 0 1 10.236 4H12V3a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      title: 'Scales with you',
      body: 'From your first user to your first million—architecture that grows as you do.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M3 3h2v18H3V3zm6 6h2v12H9V9zm6-4h2v16h-2V5zm6 8h2v8h-2v-8z" />
        </svg>
      ),
    },
    {
      title: 'Secure by default',
      body: 'Best-practice auth, data privacy, and auditability baked in from day one.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M12 1c3 2.5 6 3 9 3v7c0 5.25-3.438 9.99-9 12-5.562-2.01-9-6.75-9-12V4c3 0 6-.5 9-3zm-2 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
        </svg>
      ),
    },
  ],
};

type LeadFormData = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  marketingOk: boolean;
};

const initialForm: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  marketingOk: true,
};

export default function Home() {
  const [open, setOpen] = useState(false); // mobile nav
  const [form, setForm] = useState<LeadFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  /**
   * Minimal client-side validation.
   * Keep client validation friendly; do strict checks on the server/API route.
   */
  const validate = (data: LeadFormData) => {
    const next: Partial<Record<keyof LeadFormData, string>> = {};
    if (!data.name?.trim()) next.name = 'Please enter your name.';
    if (!data.email?.trim()) next.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'Please enter a valid email.';
    if (data.phone && !/^[0-9()+\-\s.]{7,}$/.test(data.phone)) next.phone = 'Please enter a valid phone number.';
    return next;
  };

  /**
   * Reusable change handler for controlled inputs.
   * Tip: this pattern plays well with AI codegen and keeps state updates tidy.
   */
  const handleChange =
    <K extends keyof LeadFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => ({ ...f, [key]: value as LeadFormData[K] }));
      if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }));
    };

  /**
   * Form submit:
   * - Reads the honeypot from the *actual form element* via FormData.
   *   (Important: if you bound the honeypot with React state and forced it to "",
   *    many bots wouldn't be able to "fill" it. Using FormData lets us see what
   *    the browser submits, including auto-filled bot values.)
   * - Optionally short-circuits if hp has any value (bot detected).
   * - Otherwise posts to /api/lead, where you forward to Make.com.
   *
   * Server counterpart (recommended):
   *   // app/api/lead/route.ts
   *   export async function POST(request: Request) {
   *     const { hp, ...lead } = await request.json();
   *     if (hp) return Response.json({ ok: true }); // ignore bots
   *     await fetch(process.env.MAKE_WEBHOOK_URL!, { method:'POST', body: JSON.stringify({ lead, meta:{} }), headers:{'Content-Type':'application/json'} });
   *     return Response.json({ ok: true });
   *   };
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1) client validation (UX)
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // 2) read the honeypot from the form DOM (uncontrolled input)
    const fd = new FormData(e.currentTarget);
    const hp = String(fd.get('hp') ?? '');

    // 3) Optional: silently succeed for bots without hitting the server
    if (hp) {
      setSubmitted(true);
      setForm(initialForm);
      return;
    }

    // 4) real submit
    try {
      setSubmitting(true);
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Include hp too; your API route should double-check it.
        body: JSON.stringify({ ...form, hp }),
      });
      if (!r.ok) throw new Error('Failed');
      setSubmitted(true);
      setForm(initialForm);
    } catch {
      alert('Something went wrong. Please try again or email us.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 antialiased dark:from-gray-950 dark:to-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/90 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-indigo-600 to-fuchsia-600 ring-1 ring-inset ring-black/10" />
            <span className="text-base font-semibold tracking-tight group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {SITE.name}
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden gap-8 md:flex">
            {SITE.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href="#contact"
              className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Get started
            </a>
          </div>

          {/* Mobile button */}
          <button
            aria-label="Toggle menu"
            className="inline-flex items-center rounded md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-4 sm:px-6">
              {SITE.nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Get started
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-x-0 -top-24 -z-10 transform-gpu blur-3xl">
            <div
              className="mx-auto aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-indigo-600 to-fuchsia-600 opacity-25"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {SITE.tagline}
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">{SITE.description}</p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Talk to us
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Learn more
                </a>
              </div>
            </div>

            {/* Logo cloud / visual placeholder */}
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 opacity-70 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-14 items-center justify-center rounded-md border border-gray-200 bg-white/60 backdrop-blur dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why teams choose {SITE.name}</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Sensible defaults, clean design, and maintainable code. Everything you need—nothing you don't.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SITE.features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-gray-50 py-16 dark:bg-gray-950 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About {SITE.name}</h2>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  We're a small, senior team that moves quickly. Our work blends product strategy, delightful UX,
                  and pragmatic engineering—so you ship value earlier and more often.
                </p>
                <ul className="mt-6 space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                      ✓
                    </span>
                    Clear roadmaps & measurable outcomes.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                      ✓
                    </span>
                    Transparent pricing with no surprises.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                      ✓
                    </span>
                    Built with modern, well-supported tools.
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 opacity-20 blur-xl" />
                  <div className="aspect-[4/3] w-full rounded-3xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Lead form */}
        <section id="contact" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Let's build something great</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Tell us a bit about you and your project. We'll get back within 1 business day.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              {submitted ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
                  <h3 className="text-lg font-semibold">Thanks! Your message is on its way.</h3>
                  <p className="mt-2 text-sm">
                    We'll reach out soon. Prefer instant contact? Email{' '}
                    <a className="underline" href={`mailto:${SITE.contactEmail}`}>
                      {SITE.contactEmail}
                    </a>{' '}
                    or call{' '}
                    <a className="underline" href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>
                      {SITE.phone}
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900"
                  noValidate
                >
                  {/* ── HONEYPOT (anti-spam) ─────────────────────────────────────────
                      Why not `type="hidden"`? Because real users never see it
                      (good) but many bots *ignore* hidden inputs and won't fill
                      them (bad). We want bots to fill it so we can detect them.
                      Strategy: render a normal text input but move it far off-screen.

                      Implementation details:
                      - `aria-hidden` + `tabIndex={-1}` keeps it out of a11y & tab order.
                      - Positioned off-canvas so humans never see it.
                      - Name it something plausible like "website".
                  ---------------------------------------------------------------- */}
                  <div
                    aria-hidden="true"
                    className="absolute left-[-10000px] top-0 h-0 w-0 overflow-hidden"
                  >
                    <label htmlFor="hp" className="block text-sm">
                      Website
                    </label>
                    <input
                      id="hp"
                      name="hp"
                      type="text"
                      autoComplete="off"
                      tabIndex={-1}
                      // DO NOT control this with React state; we want whatever the browser submits.
                      className="mt-2 block w-64 rounded border border-gray-300 px-2 py-1"
                      placeholder="https://"
                    />
                  </div>

                  {/* Visible fields */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium">
                        Name<span className="text-red-600">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={handleChange('name')}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="Jane Doe"
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email<span className="text-red-600">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={handleChange('email')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="jane@company.com"
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium">
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        pattern="^[0-9()+\\-\\s.]{7,}$"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="+1 555 123 4567"
                      />
                      {errors.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium">
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        value={form.company}
                        onChange={handleChange('company')}
                        className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium">
                      Project details
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange('message')}
                      className="mt-2 block w-full resize-y rounded-md border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      placeholder="Tell us about your goals, timeline, and budget (optional)."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="marketingOk"
                      name="marketingOk"
                      type="checkbox"
                      checked={form.marketingOk}
                      onChange={handleChange('marketingOk')}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                    />
                    <label htmlFor="marketingOk" className="text-sm text-gray-700 dark:text-gray-300">
                      You may send me occasional product updates and resources. (You can unsubscribe anytime.)
                    </label>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="text-xs text-gray-500">
                      By submitting, you agree to our{' '}
                      <a href="#" className="underline hover:no-underline">
                        Terms
                      </a>{' '}
                      and{' '}
                      <a href="#" className="underline hover:no-underline">
                        Privacy Policy
                      </a>
                      .
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="mr-2 h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0-2.121-2.121M8.757 8.757 6.636 6.636" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        'Send message'
                      )}
                    </button>
                  </div>

                  {/* Teaching tip:
                     - To post directly to Make (quick demo), you can skip the API route and:
                       await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK!, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ lead: form }) });
                     - Best practice is this template's flow:
                       client → /api/lead → Make.com
                       (keeps the webhook secret and lets you add auth/rate limits/validation). */}
                </form>
              )}
            </div>

            {/* Direct contact quick links */}
            <div className="mx-auto mt-6 max-w-3xl text-center text-sm text-gray-600 dark:text-gray-300">
              Prefer email or phone?{' '}
              <a className="font-medium text-indigo-600 underline-offset-2 hover:underline" href={`mailto:${SITE.contactEmail}`}>
                {SITE.contactEmail}
              </a>{' '}
              ·{' '}
              <a
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}
              >
                {SITE.phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
            <nav className="flex gap-4">
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200">Terms</a>
              <a href="#contact" className="hover:text-gray-900 dark:hover:text-gray-200">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
