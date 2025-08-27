"use client";

import React from "react";
import { useAuth } from "../contexts/auth-context";

type NavigationLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  isExternal?: boolean;
};

const NavigationLink = ({ 
  href, 
  children, 
  className = "", 
  isExternal = false 
}: NavigationLinkProps): React.JSX.Element => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";
  const combinedClasses = `${baseClasses} ${className}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <a
      href={href}
      className={combinedClasses}
      tabIndex={0}
      aria-label={typeof children === "string" ? children : undefined}
      onKeyDown={handleKeyDown}
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {children}
    </a>
  );
};

type PlatformCardProps = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  technologies: string[];
  featured?: boolean;
};

const PlatformCard = ({ 
  title, 
  description, 
  url, 
  imageUrl, 
  technologies, 
  featured = false 
}: PlatformCardProps): React.JSX.Element => {
  return (
    <div className={`group relative rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 dark:bg-dark-800 ${
      featured 
        ? 'border-2 border-primary ring-2 ring-primary ring-opacity-20 shadow-primary' 
        : 'border-neutral-300 dark:border-dark-600'
    }`}>
      {featured && (
        <div className="absolute -top-2 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
          Featured
        </div>
      )}
      <div className="aspect-video w-full rounded-lg bg-neutral-100 dark:bg-dark-700 mb-4 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#eae9e4"/><text x="150" y="100" font-family="Arial" font-size="14" fill="#071520" text-anchor="middle">${title}</text></svg>`)}`;
          }}
        />
      </div>
      <div>
        <h3 className="font-semibold text-dark-900 dark:text-neutral-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-dark-600 dark:text-neutral-400 mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white"
            >
              {tech}
            </span>
          ))}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        >
          Visit Platform →
        </a>
      </div>
    </div>
  );
};

const HomePage = (): React.JSX.Element => {
  const { user } = useAuth();

  const featuredPlatforms = [
    {
      title: "AI Task Manager Pro",
      description: "Intelligent task management with AI-powered prioritization and automated scheduling. Perfect for productivity enthusiasts.",
      url: "https://taskmanager.ianmcdonald.ai",
      imageUrl: "/images/task-manager.jpg",
      technologies: ["React", "Node.js", "OpenAI", "MongoDB"],
      featured: true,
    },
    {
      title: "Code Learning Hub",
      description: "Interactive coding tutorials with real-time feedback and personalized learning paths for developers at all levels.",
      url: "https://learn.ianmcdonald.ai",
      imageUrl: "/images/learning-hub.jpg",
      technologies: ["Next.js", "TypeScript", "Prisma", "Docker"],
      featured: true,
    },
    {
      title: "Smart Analytics Dashboard",
      description: "Real-time data visualization and business intelligence platform with advanced reporting capabilities.",
      url: "https://analytics.ianmcdonald.ai",
      imageUrl: "/images/analytics.jpg",
      technologies: ["Vue.js", "Python", "PostgreSQL", "Redis"],
      featured: false,
    },
  ];

  const platformFeatures = [
    {
      title: "Custom Applications",
      description: "Access powerful, custom-built applications designed for productivity and learning",
      icon: "🚀",
    },
    {
      title: "Interactive Lessons",
      description: "Comprehensive video tutorials and hands-on coding exercises",
      icon: "🎓",
    },
    {
      title: "Community Driven",
      description: "Connect with fellow learners and share your progress and insights",
      icon: "👥",
    },
    {
      title: "AI-Powered",
      description: "Intelligent features that adapt to your learning style and needs",
      icon: "🤖",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700"></div>
            <span className="text-xl font-bold text-dark-900 dark:text-neutral-100">
              Ian McDonald AI
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                <NavigationLink
                  href="/dashboard"
                  className="text-dark-600 hover:text-dark-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                  Dashboard
                </NavigationLink>
                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-neutral-300">
                  Welcome, {user.displayName}
                </div>
              </>
            ) : (
              <>
                <NavigationLink
                  href="/login"
                  className="text-dark-600 hover:text-dark-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                >
                  Sign In
                </NavigationLink>
                <NavigationLink
                  href="/signup"
                  className="bg-primary text-white hover:bg-primary-600"
                >
                  Get Started
                </NavigationLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-dark-900 sm:text-6xl dark:text-neutral-100">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Ian McDonald AI
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-dark-600 dark:text-neutral-300">
            Discover powerful platforms, learn through interactive lessons, and connect with a community 
            of creators. Your gateway to AI-powered productivity and learning.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            {user ? (
              <NavigationLink
                href="/dashboard"
                className="bg-primary text-white hover:bg-primary-600"
              >
                🚀 Go to Dashboard
              </NavigationLink>
            ) : (
              <>
                <NavigationLink
                  href="/signup"
                  className="bg-primary text-white hover:bg-primary-600"
                >
                  🚀 Get Started Free
                </NavigationLink>
                <NavigationLink
                  href="/login"
                  className="border border-neutral-300 text-dark-700 hover:bg-neutral-50 dark:border-dark-600 dark:text-neutral-300 dark:hover:bg-dark-700"
                >
                  Sign In
                </NavigationLink>
              </>
            )}
          </div>
        </section>

        {/* Featured Platforms Section */}
        <section className="mt-20" aria-labelledby="platforms-heading">
          <h2 
            id="platforms-heading" 
            className="text-center text-3xl font-bold tracking-tight text-dark-900 dark:text-neutral-100"
          >
            Featured Platforms
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-dark-600 dark:text-neutral-300">
            Explore powerful, custom-built applications designed to enhance your productivity and learning journey.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlatforms.map((platform) => (
              <PlatformCard
                key={platform.title}
                title={platform.title}
                description={platform.description}
                url={platform.url}
                imageUrl={platform.imageUrl}
                technologies={platform.technologies}
                featured={platform.featured}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20" aria-labelledby="features-heading">
          <h2 
            id="features-heading" 
            className="text-center text-3xl font-bold tracking-tight text-dark-900 dark:text-neutral-100"
          >
            Platform Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-dark-600 dark:text-neutral-300">
            Everything you need to learn, create, and connect in one comprehensive platform.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 dark:border-dark-600 dark:bg-dark-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-neutral-100">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-dark-600 dark:text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="mt-20 rounded-2xl bg-white p-8 shadow-sm dark:bg-dark-800" aria-labelledby="getting-started-heading">
          <h2 
            id="getting-started-heading"
            className="text-2xl font-bold text-dark-900 dark:text-neutral-100"
          >
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-dark-600 dark:text-neutral-300">
            Join thousands of learners and creators who are already using our platform to enhance their productivity and skills.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                1
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-neutral-100">
                  Create your free account
                </p>
                <p className="mt-1 text-sm text-dark-600 dark:text-neutral-400">
                  Sign up in seconds and get instant access to our platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                2
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-neutral-100">
                  Explore applications and lessons
                </p>
                <p className="mt-1 text-sm text-dark-600 dark:text-neutral-400">
                  Browse our collection of tools and start your learning journey.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                3
              </div>
              <div>
                <p className="font-medium text-dark-900 dark:text-neutral-100">
                  Connect with the community
                </p>
                <p className="mt-1 text-sm text-dark-600 dark:text-neutral-400">
                  Share your progress, ask questions, and learn from others.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {!user && (
              <NavigationLink
                href="/signup"
                className="bg-primary text-white hover:bg-primary-600"
              >
                Start Your Journey Today →
              </NavigationLink>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-neutral-200 dark:border-dark-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-dark-600 dark:text-neutral-400">
              © 2025 Ian McDonald AI. Empowering creators and learners worldwide.
            </p>
            <div className="flex items-center gap-6">
              {!user ? (
                <>
                  <NavigationLink
                    href="/login"
                    className="text-sm text-dark-600 hover:text-dark-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    Sign In
                  </NavigationLink>
                  <NavigationLink
                    href="/signup"
                    className="text-sm text-dark-600 hover:text-dark-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    Get Started
                  </NavigationLink>
                </>
              ) : (
                <NavigationLink
                  href="/dashboard"
                  className="text-sm text-dark-600 hover:text-dark-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Dashboard
                </NavigationLink>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;