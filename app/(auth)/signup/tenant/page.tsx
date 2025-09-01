"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/auth-context';
import { TenantSignupData } from '../../../../types';
import { 
  checkSubdomainAvailability, 
  generateTenantIdFromCompany,
  generateTenantUrl 
} from '../../../../lib/tenant-utils';

const TenantSignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantSignupData>({
    companyName: '',
    subdomain: '',
    industry: '',
    companySize: '',
    ownerName: '',
    ownerEmail: '',
    password: '',
    primaryColor: '#19afe2',
    features: {
      enableLessons: true,
      enableApps: true,
      enableCommunity: true
    }
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainTimeout, setSubdomainTimeout] = useState<NodeJS.Timeout | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);

  const { signUpWithTenant, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Only redirect if already logged in AND not in signup process
  useEffect(() => {
    if (!authLoading && user && !isLoading && !signupComplete) {
      console.log('🔄 User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, authLoading, router, isLoading, signupComplete]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (subdomainTimeout) {
        clearTimeout(subdomainTimeout);
      }
    };
  }, [subdomainTimeout]);

  const handleCompanyNameChange = (companyName: string) => {
    const suggestedSubdomain = generateTenantIdFromCompany(companyName);
    setFormData(prev => ({
      ...prev,
      companyName,
      subdomain: suggestedSubdomain
    }));
    // Reset subdomain availability when company name changes
    setSubdomainAvailable(null);
  };

  const checkSubdomain = async (subdomain: string) => {
    console.log(`🔍 Checking subdomain: ${subdomain}`);
    
    if (!subdomain || subdomain.length < 2) {
      console.log(`❌ Subdomain too short: ${subdomain}`);
      setSubdomainAvailable(null);
      return;
    }

    setSubdomainChecking(true);
    try {
      console.log(`🌐 Calling checkSubdomainAvailability for: ${subdomain}`);
      const available = await checkSubdomainAvailability(subdomain);
      console.log(`✅ Subdomain availability result: ${available}`);
      setSubdomainAvailable(available);
    } catch (error) {
      console.error('❌ Error checking subdomain:', error);
      setSubdomainAvailable(false);
    } finally {
      setSubdomainChecking(false);
    }
  };

  const handleSubdomainChange = (subdomain: string) => {
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, subdomain: cleanSubdomain }));
    setSubdomainAvailable(null);
    
    // Clear previous timeout
    if (subdomainTimeout) {
      clearTimeout(subdomainTimeout);
    }
    
    // Debounce subdomain checking
    const newTimeout = setTimeout(() => checkSubdomain(cleanSubdomain), 500);
    setSubdomainTimeout(newTimeout);
  };

  const validateStep = (step: number): boolean => {
    const result = (() => {
      switch (step) {
        case 1:
          return !!formData.companyName && !!formData.subdomain && subdomainAvailable === true;
        case 2:
          return true; // Customization is optional
        case 3:
          return !!formData.ownerName && !!formData.ownerEmail && !!formData.password && formData.password === confirmPassword;
        default:
          return false;
      }
    })();
    
    // Debug logging
    console.log(`🔍 Step ${step} validation:`, {
      result,
      companyName: formData.companyName,
      subdomain: formData.subdomain,
      subdomainAvailable,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      password: formData.password,
      confirmPassword,
      passwordsMatch: formData.password === confirmPassword
    });
    
    return result;
  };

  const nextStep = () => {
    const isValid = validateStep(currentStep);
    console.log(`📋 Next step validation - Step ${currentStep}: ${isValid}`);
    
    if (isValid) {
      const nextStepNumber = Math.min(currentStep + 1, 3);
      console.log(`➡️ Moving from step ${currentStep} to step ${nextStepNumber}`);
      setCurrentStep(nextStepNumber);
      setError('');
    } else {
      console.log(`❌ Cannot proceed from step ${currentStep} - validation failed`);
      // Show specific error based on step
      if (currentStep === 1) {
        if (!formData.companyName) {
          setError('Company name is required');
        } else if (!formData.subdomain) {
          setError('Subdomain is required');
        } else if (subdomainAvailable !== true) {
          setError('Please choose an available subdomain');
        }
      } else if (currentStep === 2) {
        // Step 2 is now customization - no required fields
        setError('');
      } else if (currentStep === 3) {
        if (!formData.ownerName) {
          setError('Your name is required');
        } else if (!formData.ownerEmail) {
          setError('Email address is required');
        } else if (!formData.password) {
          setError('Password is required');
        } else if (formData.password !== confirmPassword) {
          setError('Passwords do not match');
        }
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(3)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setSignupComplete(true); // Prevent redirect during signup
    setError('');
    
    console.log('🚀 Starting tenant signup process...');

    try {
      const result = await signUpWithTenant(formData);
      console.log('✅ Tenant signup successful:', result.tenant.tenantId);
      
      // Short delay to ensure auth state is properly set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the new tenant's domain
      const tenantUrl = generateTenantUrl(result.tenant.tenantId, '/dashboard');
      console.log(`🚀 Redirecting to tenant URL: ${tenantUrl}`);
      
      // In development, we'll navigate to the path-based route
      if (window.location.hostname.includes('localhost')) {
        router.push(`/${result.tenant.tenantId}/dashboard`);
      } else {
        window.location.href = tenantUrl;
      }
    } catch (error: unknown) {
      console.error('❌ Tenant signup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create your workspace';
      setError(errorMessage);
      setSignupComplete(false); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    1: 'Create Your Workspace',
    2: 'Customize Your Brand',
    3: 'Account Details'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700"></div>
          <h2 className="mt-6 text-center text-3xl font-bold text-dark-900 dark:text-neutral-100">
            {stepTitles[currentStep as keyof typeof stepTitles]}
          </h2>
          <p className="mt-2 text-center text-sm text-dark-600 dark:text-neutral-400">
            Step {currentStep} of 3 • Or{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-600 transition-colors"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${
                step <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-neutral-200 dark:bg-dark-600'
              }`}
            />
          ))}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
            </div>
          )}

          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Company Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Choose Your Subdomain *
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    required
                    value={formData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="flex-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-l-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                    placeholder="your-company"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-neutral-300 dark:border-dark-600 bg-neutral-50 dark:bg-dark-700 text-neutral-500 dark:text-neutral-400 sm:text-sm">
                    .yourplatform.com
                  </span>
                </div>
                {subdomainChecking && (
                  <p className="mt-1 text-sm text-neutral-500">Checking availability...</p>
                )}
                {subdomainAvailable === true && (
                  <p className="mt-1 text-sm text-green-600">✓ Available</p>
                )}
                {subdomainAvailable === false && (
                  <p className="mt-1 text-sm text-red-600">✗ Not available</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customization */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Primary Brand Color
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="h-10 w-20 rounded border border-neutral-300 dark:border-dark-600 cursor-pointer"
                  />
                  <span className="text-sm text-dark-600 dark:text-neutral-400">
                    {formData.primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-neutral-300 mb-3">
                  Enable Features
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'enableLessons', label: 'Learning Lessons' },
                    { key: 'enableApps', label: 'Interactive Apps' },
                    { key: 'enableCommunity', label: 'Community Forum' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features?.[key as keyof typeof formData.features] ?? false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [key]: e.target.checked
                          }
                        }))}
                        className="rounded border-neutral-300 text-primary focus:border-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-dark-700 dark:text-neutral-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-dark-900 dark:text-neutral-100 mb-2">
                  🎉 Almost ready!
                </h4>
                <p className="text-sm text-dark-600 dark:text-neutral-400">
                  Your workspace will be available at:{' '}
                  <strong className="text-primary">
                    {formData.subdomain}.yourplatform.com
                  </strong>
                </p>
                <p className="text-sm text-dark-600 dark:text-neutral-400 mt-1">
                  You'll be the admin and can invite your team later.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Account Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Your Full Name *
                </label>
                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="ownerEmail" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Email Address *
                </label>
                <input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-700 dark:text-neutral-300">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-neutral-300 dark:border-dark-600 placeholder-secondary dark:placeholder-neutral-400 text-dark-900 dark:text-neutral-100 rounded-lg bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm transition-colors"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-dark-900 dark:text-neutral-100 mb-2">
                  🎉 Ready to create your workspace!
                </h4>
                <p className="text-sm text-dark-600 dark:text-neutral-400">
                  Your workspace will be available at:{' '}
                  <strong className="text-primary">
                    {formData.subdomain}.yourplatform.com
                  </strong>
                </p>
                <p className="text-sm text-dark-600 dark:text-neutral-400 mt-1">
                  You'll be the admin and can invite your team after setup.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-dark-900 dark:hover:text-neutral-100 transition-colors"
              >
                Back
              </button>
            )}
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !validateStep(1) || !validateStep(3)}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? 'Creating workspace...' : 'Create Workspace'}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/signup"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
          >
            Want a personal account instead?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TenantSignupPage;