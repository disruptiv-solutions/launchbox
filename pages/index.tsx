// pages/index.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  LINDSAY'S BOOK CLUB NEWSLETTER WEBSITE
 *  - Newsletter signup for book reviews, reading lists, and BookTok content
 *  - The form posts to /api/newsletter (you'll create that API route) which forwards
 *    to your Make.com webhook for email list management
 *  - Includes a "honeypot" anti-spam field (named `hp`) to filter simple bots
 * ──────────────────────────────────────────────────────────────────────────────
 */
const SITE = {
  name: "Lindsay's Book Club",
  tagline: 'Read. Love. Escape.',
  description:
    'Your cozy corner for romance and fantasy book recommendations, reviews, and reading lists. Join thousands of BookTok lovers discovering their next obsession.',
  contactEmail: 'hello@lindsaysbookclub.com',
  nav: [
    { label: 'Reviews', href: '#reviews' },
    { label: 'Reading Lists', href: '#lists' },
    { label: 'Newsletter', href: '#newsletter' },
  ],
  features: [
    {
      title: 'Weekly Book Reviews',
      body: 'Honest, spoiler-free reviews of the latest romance and fantasy releases, plus hidden gems you need to know about.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      title: 'Curated Reading Lists',
      body: 'Themed book lists for every mood - from enemies-to-lovers to dragon shifters, plus seasonal TBR recommendations.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'BookTok Content',
      body: 'Behind-the-scenes from my BookTok videos, extended thoughts on viral books, and exclusive content just for subscribers.',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
  ],
};

type NewsletterFormData = {
  name: string;
  email: string;
  favoriteGenres: string[];
  readingGoal: string;
  bookFormat: string;
  marketingOk: boolean;
};

const initialForm: NewsletterFormData = {
  name: '',
  email: '',
  favoriteGenres: [],
  readingGoal: '12-24',
  bookFormat: 'any',
  marketingOk: true,
};

const Home: NextPage = () => {
  const [open, setOpen] = useState(false); // mobile nav
  const [form, setForm] = useState<NewsletterFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewsletterFormData, string>>>({});

  /**
   * Minimal client-side validation for newsletter signup
   */
  const validate = (data: NewsletterFormData) => {
    const next: Partial<Record<keyof NewsletterFormData, string>> = {};
    if (!data.name?.trim()) next.name = 'Please enter your name.';
    if (!data.email?.trim()) next.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'Please enter a valid email.';
    return next;
  };

  /**
   * Handle form field changes
   */
  const handleChange =
    <K extends keyof NewsletterFormData>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (key === 'favoriteGenres') {
        const checkbox = e.target as HTMLInputElement;
        const value = checkbox.value;
        const currentGenres = form.favoriteGenres;

        if (checkbox.checked) {
          setForm((f) => ({ ...f, favoriteGenres: [...currentGenres, value] }));
        } else {
          setForm((f) => ({ ...f, favoriteGenres: currentGenres.filter(g => g !== value) }));
        }
      } else {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm((f) => ({ ...f, [key]: value as NewsletterFormData[K] }));
      }
      if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }));
    };

  /**
   * Newsletter signup form submission
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
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hp }),
      });
      if (!r.ok) throw new Error('Failed');
      setSubmitted(true);
      setForm(initialForm);
    } catch {
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50 text-gray-900 antialiased dark:from-gray-950 dark:to-rose-950 dark:text-gray-100">
      <Head>
        <title>{SITE.name} - Romance & Fantasy Book Reviews</title>
        <meta name="description" content={`Welcome to ${SITE.name} — ${SITE.description}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#e11d48" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-rose-50/60 bg-rose-50/90 dark:bg-gray-900/80 border-b border-rose-200 dark:border-rose-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#" className="group inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-tr from-rose-600 to-pink-600 ring-1 ring-inset ring-black/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">📚</span>
            </div>
            <span className="text-base font-semibold tracking-tight group-hover:text-rose-700 dark:group-hover:text-rose-200">
              {SITE.name}
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden gap-8 md:flex">
            {SITE.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href="#newsletter"
              className="inline-flex items-center rounded-md bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Join Book Club
            </a>
          </div>

          {/* Mobile button */}
          <button
            aria-label="Toggle menu"
            className="inline-flex items-center rounded md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-800"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#newsletter"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Join Book Club
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
              className="mx-auto aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-rose-600 to-pink-600 opacity-25"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {SITE.tagline}
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-rose-800 dark:text-rose-200">{SITE.description}</p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <a
                  href="#newsletter"
                  className="inline-flex items-center rounded-md bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Join the Club
                </a>
                <a
                  href="#reviews"
                  className="inline-flex items-center rounded-md border border-rose-300 px-6 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900"
                >
                  Browse Reviews
                </a>
              </div>
            </div>

            {/* Book emojis showcase */}
            <div className="mx-auto mt-16 grid max-w-5xl grid-cols-4 gap-4 opacity-70 sm:grid-cols-8">
              {['📖', '💕', '🐉', '⚔️', '🏰', '🌙', '💫', '🔥'].map((emoji, i) => (
                <div
                  key={i}
                  className="flex h-14 items-center justify-center rounded-md border border-rose-200 bg-rose-100/60 backdrop-blur dark:border-rose-800 dark:bg-rose-900/50"
                >
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features/What You Get */}
        <section id="reviews" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What You'll Get</h2>
              <p className="mt-3 text-rose-700 dark:text-rose-300">
                Join thousands of book lovers getting the best romance and fantasy recommendations delivered weekly.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SITE.features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-rose-200 bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:border-rose-800 dark:bg-gray-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-rose-700 dark:text-rose-300">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About/Reading Lists */}
        <section id="lists" className="bg-rose-50 py-16 dark:bg-gray-950 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Next Book Obsession Awaits</h2>
                <p className="mt-4 text-rose-800 dark:text-rose-200">
                  I'm Lindsay, your BookTok friend who's read way too many books (is that even possible?). 
                  I specialize in swoony romance and epic fantasy that will keep you up until 3 AM.
                </p>
                <ul className="mt-6 space-y-3 text-rose-800 dark:text-rose-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-600/10 text-pink-600">
                      💖
                    </span>
                    Enemies-to-lovers that hit different
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-600/10 text-pink-600">
                      🗡️
                    </span>
                    Fantasy worlds you'll want to live in
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-600/10 text-pink-600">
                      📚
                    </span>
                    Hidden gems before they go viral
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-tr from-rose-600 to-pink-600 opacity-20 blur-xl" />
                  <div className="aspect-[4/3] w-full rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-100 to-pink-100 shadow-sm ring-1 ring-black/5 dark:border-rose-800 dark:from-rose-900 dark:to-pink-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📚✨</div>
                      <p className="text-rose-800 dark:text-rose-200 font-semibold">Your TBR Awaits</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section id="newsletter" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join Lindsay's Book Club Newsletter</h2>
              <p className="mt-3 text-rose-700 dark:text-rose-300">
                Get weekly book recommendations, honest reviews, and curated reading lists delivered to your inbox. Plus exclusive BookTok content!
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              {submitted ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
                  <h3 className="text-lg font-semibold">Welcome to the book club! 📚</h3>
                  <p className="mt-2 text-sm">
                    Your subscription is confirmed! Check your email for a welcome message with my current favorite reads.
                    Questions? Email{' '}
                    <a className="underline" href={`mailto:${SITE.contactEmail}`}>
                      {SITE.contactEmail}
                    </a>
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative grid gap-6 rounded-xl border border-rose-200 bg-white p-6 shadow-sm ring-1 ring-black/5 dark:border-rose-800 dark:bg-gray-900"
                  noValidate
                >
                  {/* Honeypot anti-spam field */}
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
                        className="mt-2 block w-full rounded-md border-rose-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-rose-300 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-rose-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="Your name"
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
                        className="mt-2 block w-full rounded-md border-rose-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-rose-300 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-rose-700 dark:bg-gray-950 dark:text-gray-100"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      What genres make your heart flutter? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        'Contemporary Romance',
                        'Fantasy Romance',
                        'Historical Romance',
                        'Epic Fantasy',
                        'Urban Fantasy',
                        'YA/NA Romance'
                      ].map((genre) => (
                        <label key={genre} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={genre}
                            checked={form.favoriteGenres.includes(genre)}
                            onChange={handleChange('favoriteGenres')}
                            className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 dark:border-rose-700"
                          />
                          <span className="text-sm text-rose-800 dark:text-rose-200">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="readingGoal" className="block text-sm font-medium">
                        How many books do you read per year?
                      </label>
                      <select
                        id="readingGoal"
                        name="readingGoal"
                        value={form.readingGoal}
                        onChange={handleChange('readingGoal')}
                        className="mt-2 block w-full rounded-md border-rose-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-rose-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-rose-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        <option value="1-12">1-12 books</option>
                        <option value="12-24">12-24 books</option>
                        <option value="25-50">25-50 books</option>
                        <option value="50+">50+ books (wow!)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bookFormat" className="block text-sm font-medium">
                        Preferred reading format
                      </label>
                      <select
                        id="bookFormat"
                        name="bookFormat"
                        value={form.bookFormat}
                        onChange={handleChange('bookFormat')}
                        className="mt-2 block w-full rounded-md border-rose-300 bg-white px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-rose-300 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-rose-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        <option value="any">No preference</option>
                        <option value="physical">Physical books</option>
                        <option value="ebook">E-books</option>
                        <option value="audiobook">Audiobooks</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="marketingOk"
                      name="marketingOk"
                      type="checkbox"
                      checked={form.marketingOk}
                      onChange={handleChange('marketingOk')}
                      className="mt-1 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500 dark:border-rose-700"
                    />
                    <label htmlFor="marketingOk" className="text-sm text-rose-700 dark:text-rose-300">
                      Yes! Send me book recommendations, reading lists, and updates about new reviews. I can unsubscribe anytime.
                    </label>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                      By subscribing, you'll get weekly book recommendations. We respect your privacy and will never share your email.
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center rounded-md bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60"
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
                          Joining the club...
                        </>
                      ) : (
                        'Join the Book Club 📚'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Direct contact */}
            <div className="mx-auto mt-6 max-w-3xl text-center text-sm text-rose-700 dark:text-rose-300">
              Have book questions or suggestions?{' '}
              <a className="font-medium text-rose-600 underline-offset-2 hover:underline" href={`mailto:${SITE.contactEmail}`}>
                {SITE.contactEmail}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-200 bg-rose-50 py-8 text-center text-sm text-rose-700 dark:border-rose-800 dark:bg-gray-900 dark:text-rose-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>© {new Date().getFullYear()} {SITE.name}. May your TBR pile never end.</p>
            <nav className="flex gap-4">
              <a href="#" className="hover:text-rose-900 dark:hover:text-rose-200">Privacy</a>
              <a href="#" className="hover:text-rose-900 dark:hover:text-rose-200">Terms</a>
              <a href="#newsletter" className="hover:text-rose-900 dark:hover:text-rose-200">Newsletter</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;