import React from 'react';

const TestHome: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '16px 24px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            iR
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>iREVA</span>
        </div>
        
        <a 
          href="/auth" 
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Get Started
        </a>
      </nav>

      {/* Hero Content */}
      <div style={{
        textAlign: 'center',
        color: '#fff',
        padding: '0 20px',
        maxWidth: '800px'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.1)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '25px',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '32px',
          display: 'inline-block'
        }}>
          🇳🇬 Nigeria's #1 Real Estate Investment Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 5vw, 4.5rem)',
          fontWeight: '800',
          lineHeight: '1.1',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Invest in Nigerian<br />Real Estate from Anywhere
        </h1>

        <p style={{
          fontSize: '1.3rem',
          marginBottom: '40px',
          opacity: '0.9',
          lineHeight: '1.6'
        }}>
          Access premium property investments across Lagos, Abuja, and Port Harcourt.<br />
          Start building wealth with verified properties and transparent returns.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '50px'
        }}>
          <a 
            href="/auth" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '18px 36px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '1.1rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            Start Investing Today →
          </a>

          <a 
            href="#properties" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '18px 36px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            View Properties
          </a>
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>₦2.5B+</div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Properties Funded</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>15%</div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Average Returns</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>5,000+</div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Active Investors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestHome;