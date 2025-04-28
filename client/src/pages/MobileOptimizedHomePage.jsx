import React from 'react';
import { Link } from 'wouter';

function MobileOptimizedHomePage() {
  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
    background: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  const headingStyle = {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    marginBottom: '1rem',
    color: '#1a1a1a',
  };

  const paragraphStyle = {
    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
    marginBottom: '2rem',
    color: '#333',
    maxWidth: '90%',
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Welcome to iREVA</h1>
      <p style={paragraphStyle}>
        Unlock prime real estate investments with ease.
        Invest, grow, and manage your portfolio — anytime, anywhere.
      </p>
      <Link href="/invest" style={buttonStyle}>
        Start Investing
      </Link>
    </div>
  );
}

export default MobileOptimizedHomePage;