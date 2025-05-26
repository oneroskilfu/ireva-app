import React from 'react';

const BrandedHome: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1F6FEB 0%, #0A192F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#2D2D2D'
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
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              fontFamily: 'IBM Plex Mono, monospace', 
              fontWeight: '400', 
              fontSize: '1.5rem',
              color: '#2D2D2D'
            }}>i</span>
            <span style={{ 
              fontFamily: 'Outfit, sans-serif', 
              fontWeight: '300', 
              fontSize: '1.5rem',
              color: '#2D2D2D',
              letterSpacing: '0.5px'
            }}>REVA</span>
          </div>
        </div>
        
        <a 
          href="/auth" 
          style={{
            background: '#1F6FEB',
            color: '#FFFFFF',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            transition: 'background-color 0.2s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#155CC2'}
          onMouseOut={(e) => e.currentTarget.style.background = '#1F6FEB'}
        >
          Get Started
        </a>
      </nav>

      {/* Hero Content */}
      <div style={{
        textAlign: 'center',
        color: '#FFFFFF',
        padding: '0 20px',
        maxWidth: '800px'
      }}>
        <div style={{
          background: 'rgba(0, 184, 148, 0.2)',
          color: '#FFFFFF',
          padding: '8px 16px',
          borderRadius: '25px',
          fontSize: '0.9rem',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '500',
          marginBottom: '32px',
          display: 'inline-block',
          border: '1px solid rgba(0, 184, 148, 0.3)'
        }}>
          🇳🇬 Nigeria's Premier Real Estate Investment Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 5vw, 4.5rem)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '700',
          lineHeight: '1.1',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Build Wealth Through<br />Nigerian Real Estate
        </h1>

        <p style={{
          fontSize: '1.3rem',
          marginBottom: '40px',
          opacity: '0.9',
          lineHeight: '1.6',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '400'
        }}>
          Access verified property investments across Lagos, Abuja, and Port Harcourt.<br />
          Transparent returns, secure transactions, world-class platform.
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
              background: '#00B894',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#00A085'}
            onMouseOut={(e) => e.currentTarget.style.background = '#00B894'}
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
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '1.1rem',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            View Properties
          </a>
        </div>

        {/* Trust Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '24px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700', 
              marginBottom: '4px',
              color: '#00B894'
            }}>₦2.5B+</div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: '0.8',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400'
            }}>Properties Funded</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700', 
              marginBottom: '4px',
              color: '#00B894'
            }}>15%</div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: '0.8',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400'
            }}>Average Returns</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700', 
              marginBottom: '4px',
              color: '#00B894'
            }}>5,000+</div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: '0.8',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400'
            }}>Active Investors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedHome;