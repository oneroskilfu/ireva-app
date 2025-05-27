import React, { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="font-inter text-midnight-navy min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 z-50 border-b border-gray-200/50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-electric-blue to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="font-mono text-white font-normal text-sm sm:text-base">i</span>
            </div>
            <div className="flex items-center">
              <span className="font-mono font-normal text-lg sm:text-xl text-midnight-navy">i</span>
              <span className="font-outfit font-light text-lg sm:text-xl text-midnight-navy tracking-wide">REVA</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/properties" className="text-gray-600 hover:text-electric-blue transition-colors font-medium">
              Properties
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-electric-blue transition-colors font-medium">
              How It Works
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-electric-blue transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-electric-blue transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-electric-blue hover:text-electric-blue/80 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-electric-blue transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link 
                href="/properties" 
                className="block py-2 text-gray-600 hover:text-electric-blue transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Properties
              </Link>
              <Link 
                href="/how-it-works" 
                className="block py-2 text-gray-600 hover:text-electric-blue transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="/about" 
                className="block py-2 text-gray-600 hover:text-electric-blue transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block py-2 text-gray-600 hover:text-electric-blue transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link 
                  href="/login" 
                  className="block w-full py-3 text-center text-electric-blue hover:text-electric-blue/80 transition-colors font-medium border border-electric-blue rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full py-3 text-center bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

        {/* Hero Section */}
        <section className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <defs>
                <pattern id="hero-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <polygon fill="#1F6FEB" fillOpacity="0.03" points="50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-electric-blue/10 text-electric-blue rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></span>
                    Trusted by 10,000+ Nigerian Investors
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-midnight-navy mb-6 leading-tight">
                  Invest in Nigerian 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-emerald-500">
                    {" "}Real Estate
                  </span>
                  <br className="hidden sm:block" />
                  from ₦100,000
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Join thousands of Nigerians building wealth through fractional real estate investments. 
                  Start with as little as ₦100,000 and earn passive income from premium properties.
                </p>

                {/* Mobile-Optimized CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/register" 
                    className="w-full sm:w-auto px-8 py-4 bg-electric-blue text-white rounded-xl hover:bg-electric-blue/90 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    Start Investing Today
                  </Link>
                  <Link 
                    href="/properties" 
                    className="w-full sm:w-auto px-8 py-4 border-2 border-electric-blue text-electric-blue rounded-xl hover:bg-electric-blue/5 transition-all font-semibold text-lg"
                  >
                    View Properties
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                      SEC Registered
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                      Bank-Level Security
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                      12-15% Annual Returns
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image/Visual */}
              <div className="relative mt-8 lg:mt-0">
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto lg:max-w-none">
                  {/* Investment Dashboard Preview */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-midnight-navy mb-4">Your Portfolio</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-midnight-navy">Lagos Premium Apartments</p>
                          <p className="text-sm text-gray-500">Investment: ₦500,000</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+14.2%</p>
                          <p className="text-xs text-gray-500">Annual Return</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-midnight-navy">Abuja Commercial Plaza</p>
                          <p className="text-sm text-gray-500">Investment: ₦750,000</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+12.8%</p>
                          <p className="text-xs text-gray-500">Annual Return</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Portfolio Value</span>
                      <span className="text-2xl font-bold text-midnight-navy">₦1,420,500</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Monthly Returns</span>
                      <span className="text-lg font-semibold text-green-600">+₦18,750</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-electric-blue/20 rounded-full animate-bounce hidden lg:block"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-500/20 rounded-full animate-pulse hidden lg:block"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-midnight-navy mb-4">
                Why Nigerian Investors Choose iREVA
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Access premium real estate investments with complete transparency, security, and flexibility.
              </p>
            </div>

            {/* Mobile-Optimized Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-electric-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-midnight-navy mb-3">Bank-Level Security</h3>
                <p className="text-gray-600">Your investments are protected with enterprise-grade security and regulatory compliance.</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-electric-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-midnight-navy mb-3">Proven Returns</h3>
                <p className="text-gray-600">Average 12-15% annual returns from carefully vetted Nigerian real estate properties.</p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-electric-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-midnight-navy mb-3">Low Minimum</h3>
                <p className="text-gray-600">Start investing from just ₦100,000 and diversify across multiple properties.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-midnight-navy mb-4">
                Featured Investment Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Handpicked properties in prime Nigerian locations offering exceptional returns.
              </p>
            </div>

            {/* Mobile-Responsive Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Property Card 1 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-electric-blue/20 to-emerald-500/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Lagos Premium Property</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    14.2% ROI
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-midnight-navy mb-2">Lagos Premium Apartments</h3>
                  <p className="text-gray-600 mb-4">Modern residential complex in Victoria Island with guaranteed rental income.</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Minimum Investment</span>
                    <span className="font-semibold text-midnight-navy">₦500,000</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">Total Value</span>
                    <span className="font-semibold text-midnight-navy">₦2.5B</span>
                  </div>
                  <Link 
                    href="/properties/1" 
                    className="w-full block text-center py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Property Card 2 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Abuja Commercial Hub</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    12.8% ROI
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-midnight-navy mb-2">Abuja Commercial Plaza</h3>
                  <p className="text-gray-600 mb-4">Prime commercial space in Wuse II with multinational tenants.</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Minimum Investment</span>
                    <span className="font-semibold text-midnight-navy">₦750,000</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">Total Value</span>
                    <span className="font-semibold text-midnight-navy">₦3.2B</span>
                  </div>
                  <Link 
                    href="/properties/2" 
                    className="w-full block text-center py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Property Card 3 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">Port Harcourt Estate</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    15.1% ROI
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-midnight-navy mb-2">Port Harcourt Luxury Estate</h3>
                  <p className="text-gray-600 mb-4">High-end residential development with oil industry professionals.</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">Minimum Investment</span>
                    <span className="font-semibold text-midnight-navy">₦400,000</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">Total Value</span>
                    <span className="font-semibold text-midnight-navy">₦1.8B</span>
                  </div>
                  <Link 
                    href="/properties/3" 
                    className="w-full block text-center py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/properties" 
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-electric-blue text-electric-blue rounded-xl hover:bg-electric-blue/5 transition-all font-semibold text-lg"
              >
                View All Properties
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile-Optimized Footer */}
        <footer className="bg-midnight-navy text-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="font-mono text-white font-normal">i</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono font-normal text-xl text-white">i</span>
                    <span className="font-outfit font-light text-xl text-white tracking-wide">REVA</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Democratizing real estate investment for all Nigerians through innovative technology and transparent processes.
                </p>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-sm font-bold">f</span>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-sm font-bold">t</span>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="text-sm font-bold">in</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-6">Platform</h4>
                <div className="space-y-3">
                  <Link href="/properties" className="block text-gray-300 hover:text-white transition-colors">Properties</Link>
                  <Link href="/how-it-works" className="block text-gray-300 hover:text-white transition-colors">How It Works</Link>
                  <Link href="/returns" className="block text-gray-300 hover:text-white transition-colors">Returns</Link>
                  <Link href="/security" className="block text-gray-300 hover:text-white transition-colors">Security</Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold mb-6">Support</h4>
                <div className="space-y-3">
                  <Link href="/help" className="block text-gray-300 hover:text-white transition-colors">Help Center</Link>
                  <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">Contact Us</Link>
                  <Link href="/faq" className="block text-gray-300 hover:text-white transition-colors">FAQ</Link>
                  <Link href="/blog" className="block text-gray-300 hover:text-white transition-colors">Blog</Link>
                </div>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-6">Legal</h4>
                <div className="space-y-3">
                  <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/compliance" className="block text-gray-300 hover:text-white transition-colors">Compliance</Link>
                  <Link href="/risk" className="block text-gray-300 hover:text-white transition-colors">Risk Disclosure</Link>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-300 text-sm text-center md:text-left">
                  © 2024 iREVA. All rights reserved. Licensed by the Securities and Exchange Commission (SEC) Nigeria.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>🇳🇬 Made in Nigeria</span>
                  <span>•</span>
                  <span>SEC Registered</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(31, 111, 235, 0.1)',
              color: '#1F6FEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '32px',
              border: '1px solid rgba(31, 111, 235, 0.2)'
            }}>
              <span>🇳🇬</span>
              Nigeria's Leading Real Estate Platform
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              color: '#0A192F',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              Invest in Nigerian<br />
              <span style={{
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Real Estate
              </span><br />
              from Anywhere
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '40px',
              maxWidth: '500px'
            }}>
              Access premium property investments across Lagos, Abuja, and Port Harcourt. Start building wealth with verified properties and transparent returns.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '48px',
              flexWrap: 'wrap'
            }}>
              <Link 
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(31, 111, 235, 0.25)'
                }}
              >
                Start Investing
                <span>→</span>
              </Link>

              <Link 
                href="/properties" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: '#fff',
                  color: '#0A192F',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
              >
                View Properties
              </Link>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              gap: '40px',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '4px' }}>₦2.5B+</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Properties Funded</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '4px' }}>15%</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Average Returns</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '4px' }}>5,000+</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Active Investors</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div style={{
            position: 'relative',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Main Property Card */}
            <div style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9',
              maxWidth: '400px',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Property Image */}
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  15.2% ROI
                </div>
              </div>

              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#0A192F'
              }}>
                Victoria Island Premium
              </h3>
              
              <p style={{
                color: '#64748b',
                fontSize: '0.95rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Victoria Island, Lagos
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1F6FEB' }}>
                    ₦250,000
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Minimum Investment
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0A192F' }}>
                    78% Funded
                  </div>
                  <div style={{
                    width: '100px',
                    height: '6px',
                    background: '#f1f5f9',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: '78%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #1F6FEB, #00B894)'
                    }} />
                  </div>
                </div>
              </div>

              <Link 
                href="/register"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                Invest Now
              </Link>
            </div>

            {/* Floating Elements */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#1F6FEB'
            }}>
              +15.2% Returns
            </div>

            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#1F6FEB'
            }}>
              Verified Property
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section style={{
        padding: '100px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(31, 111, 235, 0.1)',
              color: '#1F6FEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(31, 111, 235, 0.2)'
            }}>
              Why iREVA?
            </div>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              marginBottom: '20px',
              color: '#0A192F',
              letterSpacing: '-0.02em'
            }}>
              Built for Modern Investors
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Experience the future of real estate investment with our cutting-edge platform designed for Nigerian investors.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            marginBottom: '80px'
          }}>
            {/* Enhanced Feature 1 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: '#0A192F' }}>
                SEC-Verified Properties
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Every property undergoes rigorous due diligence by our certified valuation experts and legal team, ensuring complete transparency and regulatory compliance.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1F6FEB',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                100% Due Diligence Completed
              </div>
            </div>

            {/* Enhanced Feature 2 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  <polyline points="17,1 21,5 17,9"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: '#0A192F' }}>
                Fractional Ownership
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Own a piece of premium Nigerian real estate starting from ₦50,000. Build your portfolio across multiple properties and locations with ease.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1F6FEB',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Minimum ₦50,000 Investment
              </div>
            </div>

            {/* Enhanced Feature 3 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'left',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: '#0A192F' }}>
                Real-Time Analytics
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                Monitor your investment performance with live updates, detailed ROI tracking, and predictive market analytics powered by advanced data insights.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1F6FEB',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                24/7 Portfolio Monitoring
              </div>
            </div>
          </div>

          {/* Trust Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            padding: '40px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '8px' }}>99.8%</div>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>Customer Satisfaction</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '8px' }}>₦12B+</div>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>Assets Under Management</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '8px' }}>50K+</div>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>Active Investors</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1F6FEB', marginBottom: '8px' }}>18.5%</div>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>Average Annual Returns</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunities Section */}
      <section id="properties" style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(31, 111, 235, 0.1)',
              color: '#1F6FEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(31, 111, 235, 0.2)'
            }}>
              Investment Opportunities
            </div>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              marginBottom: '20px',
              color: '#0A192F',
              letterSpacing: '-0.02em'
            }}>
              Premium Nigerian Properties
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Carefully curated investment opportunities across Nigeria's most promising real estate markets.
            </p>
          </div>

          {/* Property Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '32px',
            marginBottom: '60px'
          }}>
            {/* Property 1 - Lagos */}
            <div style={{
              background: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  19.2% Expected ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1F6FEB',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  FUNDING NOW
                </div>
              </div>

              <div style={{ padding: '32px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#0A192F'
                }}>
                  Lekki Phase 2 Residences
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Lekki Phase 2, Lagos State
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F6FEB' }}>
                      ₦500,000
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0A192F' }}>
                      85% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '6px'
                    }}>
                      <div style={{
                        width: '85%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #1F6FEB, #00B894)'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>24 Months</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Investment Period</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>Quarterly</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Return Payments</div>
                  </div>
                </div>

                <Link 
                  href="/register"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Invest Now
                </Link>
              </div>
            </div>

            {/* Property 2 - Abuja */}
            <div style={{
              background: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  16.8% Expected ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#9333EA',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  NEW LISTING
                </div>
              </div>

              <div style={{ padding: '32px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#0A192F'
                }}>
                  Maitama District Towers
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Maitama, Abuja FCT
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#9333EA' }}>
                      ₦750,000
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0A192F' }}>
                      42% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '6px'
                    }}>
                      <div style={{
                        width: '42%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #9333EA, #EC4899)'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>36 Months</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Investment Period</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>Bi-Annual</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Return Payments</div>
                  </div>
                </div>

                <Link 
                  href="/register"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Invest Now
                </Link>
              </div>
            </div>

            {/* Property 3 - Port Harcourt */}
            <div style={{
              background: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  <rect x="9" y="9" width="6" height="6"/>
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  22.1% Expected ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#F59E0B',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  HOT DEAL
                </div>
              </div>

              <div style={{ padding: '32px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#0A192F'
                }}>
                  GRA Commercial Complex
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '1rem',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  GRA, Port Harcourt
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F59E0B' }}>
                      ₦300,000
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0A192F' }}>
                      67% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '6px'
                    }}>
                      <div style={{
                        width: '67%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #F59E0B, #EF4444)'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>18 Months</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Investment Period</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A192F' }}>Monthly</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Return Payments</div>
                  </div>
                </div>

                <Link 
                  href="/register"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Invest Now
                </Link>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link 
              href="/properties"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(31, 111, 235, 0.25)'
              }}
            >
              Explore All Properties
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '100px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(31, 111, 235, 0.1)',
              color: '#1F6FEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(31, 111, 235, 0.2)'
            }}>
              Investor Stories
            </div>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              marginBottom: '20px',
              color: '#0A192F',
              letterSpacing: '-0.02em'
            }}>
              Trusted by Nigerian Investors
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Real stories from investors who are building wealth through our platform.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {/* Testimonial 1 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: '#0A192F',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                "iREVA made real estate investment accessible to me as a young professional. I started with ₦200,000 and have seen consistent 17% returns. The platform is transparent and professional."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '1.2rem'
                }}>
                  A
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0A192F', fontSize: '1rem' }}>Adaora Okafor</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Software Engineer, Lagos</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: '#0A192F',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                "As a diaspora Nigerian, iREVA gave me the opportunity to invest back home safely. The due diligence process is thorough and I receive quarterly updates on my investments."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '1.2rem'
                }}>
                  C
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0A192F', fontSize: '1rem' }}>Chidi Onwuegbu</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Business Analyst, Toronto</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: '#0A192F',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                "I've diversified my investment portfolio across multiple properties on iREVA. The platform's analytics help me make informed decisions and the returns have been excellent."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '1.2rem'
                }}>
                  F
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0A192F', fontSize: '1rem' }}>Fatima Abdullahi</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Doctor, Abuja</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #0A192F 0%, #1e293b 100%)',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(31, 111, 235, 0.2)',
              color: '#1F6FEB',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(31, 111, 235, 0.3)'
            }}>
              Security & Compliance
            </div>
            <h2 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              marginBottom: '20px',
              color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              Bank-Level Security
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Your investments are protected by enterprise-grade security and full regulatory compliance.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}>
            {/* Security Feature 1 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                SEC Licensed
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Fully licensed by the Nigerian Securities and Exchange Commission with regular compliance audits and reporting.
              </p>
            </div>

            {/* Security Feature 2 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                256-Bit Encryption
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Advanced encryption protocols protect all transactions and personal data with military-grade security standards.
              </p>
            </div>

            {/* Security Feature 3 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 32px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                Legal Protection
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                All investments are backed by legal documentation and investor protection insurance coverage.
              </p>
            </div>
          </div>

          {/* Compliance Logos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F6FEB' }}>SEC</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Securities & Exchange Commission</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F6FEB' }}>CBN</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Central Bank of Nigeria</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F6FEB' }}>ISO</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ISO 27001 Certified</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1F6FEB' }}>SSL</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>SSL/TLS Encryption</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '60px',
            color: '#0A192F'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            {/* Step 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#1F6FEB',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Create Account
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Sign up and complete your KYC verification in under 5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#1F6FEB',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Browse Properties
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Explore our curated selection of high-yield investment opportunities.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#1F6FEB',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Start Earning
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Invest and watch your money grow with our automated distribution system.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '60px' }}>
            <Link 
              href="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(31, 111, 235, 0.25)'
              }}
            >
              Get Started Today
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #1e293b 100%)',
        color: '#fff',
        padding: '80px 20px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Main Footer Content - Fundrise Style Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px repeat(4, 1fr)',
            gap: '80px',
            marginBottom: '60px',
            alignItems: 'start'
          }}>
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
                </div>
              </div>
              <div style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.4' }}>
                15 Broad Street, 5th Floor<br />
                Lagos Island, Lagos 100001
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>Contact us</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="#linkedin" style={{ color: '#94a3b8', fontSize: '18px', textDecoration: 'none', transition: 'color 0.3s ease' }}>in</a>
                <a href="#facebook" style={{ color: '#94a3b8', fontSize: '18px', textDecoration: 'none', transition: 'color 0.3s ease' }}>f</a>
                <a href="#instagram" style={{ color: '#94a3b8', fontSize: '18px', textDecoration: 'none', transition: 'color 0.3s ease' }}>📷</a>
                <a href="#twitter" style={{ color: '#94a3b8', fontSize: '18px', textDecoration: 'none', transition: 'color 0.3s ease' }}>𝕏</a>
              </div>
            </div>

            {/* Invest Column */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>Invest</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="/properties" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Real estate</a>
                <a href="#private-credit" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Private credit</a>
                <a href="#venture" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Venture</a>
                <a href="#retirement" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Retirement</a>
              </div>
            </div>

            {/* Client Returns Column */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>Client returns</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="#for-advisors" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>For advisors</a>
                <a href="#ireva-connect-api" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>iREVA Connect API</a>
              </div>
            </div>

            {/* Resources Column */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="#why-ireva" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Why iREVA</a>
                <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>How it works</a>
                <a href="#help-center" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Help center</a>
                <a href="#articles" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Articles</a>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="#about-us" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>About us</a>
                <a href="#press" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Press</a>
                <a href="#careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s ease' }}>Careers</a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div style={{
            background: 'rgba(31, 111, 235, 0.1)',
            padding: '40px',
            borderRadius: '20px',
            marginBottom: '40px',
            textAlign: 'center',
            border: '1px solid rgba(31, 111, 235, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#fff'
            }}>
              Stay Updated on Investment Opportunities
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '24px',
              fontSize: '1rem'
            }}>
              Get exclusive access to new properties and market insights delivered to your inbox.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '400px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}>
              <input
                type="email"
                placeholder="Enter your email address"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '1rem',
                  minWidth: '200px'
                }}
              />
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Subscribe
              </button>
            </div>
          </div>

          {/* Legal & Copyright */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth >= 768 ? '1fr auto' : '1fr',
            gap: '20px',
            alignItems: 'center',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <p style={{
                color: '#64748b',
                fontSize: '0.9rem',
                margin: 0,
                lineHeight: '1.5'
              }}>
                &copy; 2024 iREVA Technologies Limited. All rights reserved. | RC: 1234567 | 
                Licensed by the Nigerian Securities and Exchange Commission (SEC/REG/CORP/2024/001)
              </p>
              <div style={{
                display: 'flex',
                gap: '24px',
                marginTop: '12px',
                flexWrap: 'wrap'
              }}>
                <a href="#privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
                <a href="#terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
                <a href="#compliance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Compliance</a>
                <a href="#risk-disclosure" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Risk Disclosure</a>
              </div>
            </div>
            <div style={{ textAlign: window.innerWidth >= 768 ? 'right' : 'left' }}>
              <div style={{
                color: '#64748b',
                fontSize: '0.8rem',
                marginBottom: '8px'
              }}>
                Secured by
              </div>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: window.innerWidth >= 768 ? 'flex-end' : 'flex-start'
              }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#1F6FEB',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>256-bit SSL</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#1F6FEB',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;