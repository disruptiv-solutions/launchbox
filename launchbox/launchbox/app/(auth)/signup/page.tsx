"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';

const SignupPage = () => {
const [displayName, setDisplayName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [error, setError] = useState('');
const [formLoading, setFormLoading] = useState(false);
const { signUp, user, loading: authLoading } = useAuth();
const router = useRouter();

// Redirect if already logged in
useEffect(() => {
if (!authLoading && user) {
router.replace('/dashboard');
}
}, [user, authLoading, router]);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (!displayName || !email || !password || !confirmPassword) {
setError('Please fill in all fields');
return;
}

if (password !== confirmPassword) {
setError('Passwords do not match');
return;
}

setFormLoading(true);
setError('');

try {
await signUp(email, password, displayName);
// The useEffect above will handle the redirect when user state updates
} catch (error: unknown) {
const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
setError(errorMessage);
} finally {
setFormLoading(false);
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
<div className="max-w-md w-full space-y-8">
<div>
<div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700"></div>
<h2 className="mt-6 text-center text-3xl font-bold text-dark-900 dark:text-neutral-100">
Create a new account
</h2>
<p className="mt-2 text-center text-sm text-dark-600 dark:text-neutral-400">
Or{' '}
<Link
href="/login"
className="font-medium text-primary hover:text-primary-600 transition-colors"
>
sign in to your account
</Link>
</p>
</div>

<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
{error && (
<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
<div className="text-sm text-red-800 dark:text-red-400">{error}</div>
</div>
)}

<div className="space-y-4">
<div>
<label htmlFor="displayName" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
Display Name
</label>
<input
id="displayName"
name="displayName"
type="text"
autoComplete="name"
required
value={displayName}
onChange={(e) => setDisplayName(e.target.value)}
className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
placeholder="Enter your display name"
/>
</div>
<div>
<label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
Email address
</label>
<input
id="email"
name="email"
type="email"
autoComplete="email"
required
value={email}
onChange={(e) => setEmail(e.target.value)}
className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
placeholder="Enter your email"
/>
</div>

<div>
<label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
Password
</label>
<input
id="password"
name="password"
type="password"
autoComplete="new-password"
required
value={password}
onChange={(e) => setPassword(e.target.value)}
className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
placeholder="Enter your password"
/>
</div>
<div>
<label htmlFor="confirm-password" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
Confirm Password
</label>
<input
id="confirm-password"
name="confirm-password"
type="password"
autoComplete="new-password"
required
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
placeholder="Confirm your password"
/>
</div>
</div>

<div>
<button
type="submit"
disabled={formLoading}
className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
>
{formLoading ? 'Creating account...' : 'Sign up'}
</button>
</div>
</form>
</div>
</div>
);
};

export default SignupPage;
