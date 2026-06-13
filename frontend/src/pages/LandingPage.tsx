import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Link2,
  Zap,
  Shield,
  QrCode,
  ArrowRight,
  Sun,
  Moon,
  Github,
  Globe,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { CanvasBackground } from '../components/CanvasBackground';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [demoUrl, setDemoUrl] = useState('');
  const [shortenedDemo, setShortenedDemo] = useState('');
  const [copied, setCopied] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  const handleDemoShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl) return;

    setIsShortening(true);
    // Simulate API delay
    setTimeout(() => {
      const randomCode = Math.random().toString(36).substring(2, 7);
      setShortenedDemo(`${window.location.origin}/r/${randomCode}`);
      setIsShortening(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedDemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { number: '150M+', label: 'Links Created' },
    { number: '2.4B+', label: 'Clicks Tracked' },
    { number: '99.99%', label: 'Uptime' },
    { number: '< 10ms', label: 'Redirect Speed' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-time Analytics',
      desc: 'Get deep insights on who clicked your link, where, when, and from what device in real-time.',
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      icon: QrCode,
      title: 'Dynamic QR Codes',
      desc: 'Every short URL generates a custom high-fidelity QR Code that updates its destination instantly.',
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      icon: Globe,
      title: 'Geographical Insights',
      desc: 'Identify top click sources by country and city to optimize your localized marketing campaigns.',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      icon: Shield,
      title: 'Secure Redirections',
      desc: 'Safeguard your audience with our built-in HTTPS endpoints, rate limits, and malicious link shields.',
      color: 'text-rose-500 bg-rose-500/10'
    },
  ];



  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-indigo-550 selection:text-white">
      {/* Interactive Canvas Mesh */}
      <CanvasBackground />

      {/* Landing Header */}
      <header className="relative z-10 max-w-7xl mx-auto flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <Link2 className="h-5 w-5" />
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Nano Link
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-650 dark:text-slate-350">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#demo" className="hover:text-indigo-600 transition-colors">Shorten Demo</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          <Link
            to="/login"
            className="hidden sm:inline-block text-sm font-semibold hover:text-indigo-600 transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            to="/signup"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 dark:border-indigo-950/50 dark:bg-indigo-950/20 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Nano Link — Fast, Secure & Custom URL Shortener with Advanced Analytics</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight"
        >
          Connections made simple, links made{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            powerful
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-slate-650 dark:text-slate-350 max-w-xl leading-relaxed"
        >
          Nano Link is the developer-first URL shortener designed to build brand trust, generate QR codes on the fly, and deliver beautiful charts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/signup"
            className="group flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 font-bold text-white shadow-xl hover:shadow-indigo-500/20 transition-all"
          >
            Start for free
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="rounded-xl border border-slate-250 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur px-6 py-3.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Try URL Shortener
          </a>
        </motion.div>
      </section>

      {/* Widget Demo Section */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-50 z-0 pointer-events-none" />
          
          <h2 className="text-xl sm:text-2xl font-bold mb-4 relative z-10">Shorten links instantly</h2>
          
          <form onSubmit={handleDemoShorten} className="flex flex-col sm:flex-row gap-3 relative z-10">
            <input
              type="url"
              required
              placeholder="Paste your long destination URL here (e.g. https://github.com/google/gemini)"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="flex-1 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605 focus:border-indigo-605"
            />
            <button
              type="submit"
              disabled={isShortening}
              className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm px-6 py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-650/10"
            >
              {isShortening ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Shortening...
                </>
              ) : (
                'Shorten Link'
              )}
            </button>
          </form>

          {/* Shortened URL Preview Form */}
          {shortenedDemo && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-indigo-200/50 bg-indigo-50/30 dark:border-indigo-950/50 dark:bg-indigo-950/10 p-4 relative z-10 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Your Shortened Link</p>
                <p className="mt-1 font-bold text-sm sm:text-base truncate text-slate-800 dark:text-slate-250 select-all">
                  {shortenedDemo}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg border border-indigo-205 dark:border-indigo-900 bg-white dark:bg-slate-900 p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500 animate-bounce" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white p-2 text-xs font-semibold px-4 flex items-center gap-1 transition-colors"
                >
                  Track Clicks
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur border border-slate-200/30 dark:border-slate-800/30 p-8 rounded-2xl">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{s.number}</h3>
              <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Detail Grid */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">All-in-one branding and analytics platform</h2>
          <p className="text-slate-650 dark:text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
            Stop pasting raw long links. Build custom short codes, track browser metrics, and process URLs in bulk with our developer dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01, translateY: -3 }}
                className="glass-card p-6 flex gap-5 hover:border-indigo-550/20 dark:hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl ${f.color} shrink-0 self-start`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-sm text-slate-650 dark:text-slate-450 mt-2.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>



      {/* CTA Footer */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-30 z-0 pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-extrabold relative z-10">Start branding your links today</h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-650 dark:text-slate-355 max-w-md mx-auto relative z-10">
            Generate high-speed redirects, scan device metrics, and optimize your conversion graphs with Nano Link.
          </p>
          <div className="mt-8 flex justify-center gap-4 relative z-10">
            <Link
              to="/signup"
              className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/20 transition-all"
            >
              Sign Up Now
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Details */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-450">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-indigo-550" />
            <span className="font-bold">Nano Link © 2026</span>
          </div>
          <p>Created by Senior Backend Architects & Product Designers.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-200"><Github className="h-4 w-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};
