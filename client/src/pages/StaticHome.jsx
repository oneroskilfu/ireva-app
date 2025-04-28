// src/pages/StaticHome.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import './StaticHome.css'; // Import the CSS styling

const StaticHome = () => {
  return (
    <div className="home-container">
      {/* SEO HEAD */}
      <Helmet>
        <title>iREVA - Smart Real Estate Investing Platform</title>
        <meta name="description" content="Invest in fractional real estate assets securely with crypto integration, smart contracts, and high ROI opportunities. Join iREVA today!" />
        
        {/* OpenGraph for social sharing */}
        <meta property="og:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta property="og:description" content="Invest smarter with iREVA. Verified properties, fractional ownership, crypto support, and blockchain security." />
        <meta property="og:image" content="/assets/ireva-og-image.png" />
        <meta property="og:url" content="https://yourdomain.com/static-home" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="iREVA - Smart Real Estate Investing Platform" />
        <meta name="twitter:description" content="Real estate investments made simple and secure through crypto and blockchain technology." />
        <meta name="twitter:image" content="/assets/ireva-og-image.png" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to iREVA</h1>
          <p>Smart, Secure, and Crypto-Powered Real Estate Investing</p>
          <a href="/signup" className="cta-button">Start Investing</a>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="features">
        <div className="feature-item">
          <h3>Fractional Ownership</h3>
          <p>Invest in prime properties with as little as $100.</p>
        </div>
        <div className="feature-item">
          <h3>Crypto Enabled</h3>
          <p>Deposit and invest using Bitcoin, USDT, and more.</p>
        </div>
        <div className="feature-item">
          <h3>Verified Properties</h3>
          <p>Every project is vetted for transparency and ROI.</p>
        </div>
        <div className="feature-item">
          <h3>Smart Contract Secured</h3>
          <p>Your transactions are blockchain-verified.</p>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">1. Sign Up</div>
          <div className="step">2. Browse Properties</div>
          <div className="step">3. Invest Seamlessly</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} iREVA. All rights reserved.</p>
        <div className="footer-links">
          <a href="/about">About</a> | 
          <a href="/privacy">Privacy</a> | 
          <a href="/terms">Terms</a> | 
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default StaticHome;