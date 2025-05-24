// Clean, simple StaticHome component - your beautiful iREVA homepage
import React from 'react';

const StaticHome: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        height: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
            Welcome to iREVA
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', maxWidth: '600px' }}>
            Smart, Secure, and Crypto-Powered Real Estate Investing
          </p>
          <a 
            href="/signup" 
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#ff7b00',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: '0.3s',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e06600'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff7b00'}
          >
            Start Investing
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '50px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333', fontSize: '1.5rem' }}>
            Fractional Ownership
          </h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Invest in prime properties with as little as $100.
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333', fontSize: '1.5rem' }}>
            Crypto Enabled
          </h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Deposit and invest using Bitcoin, USDT, and more.
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333', fontSize: '1.5rem' }}>
            Verified Properties
          </h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Every project is vetted for transparency and ROI.
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: '10px', color: '#333', fontSize: '1.5rem' }}>
            Smart Contract Secured
          </h3>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            Your transactions are blockchain-verified.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>
          How It Works
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          marginTop: '20px'
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            minWidth: '200px'
          }}>
            <strong>1. Sign Up</strong>
          </div>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            minWidth: '200px'
          }}>
            <strong>2. Browse Properties</strong>
          </div>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            minWidth: '200px'
          }}>
            <strong>3. Invest Seamlessly</strong>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#333',
        color: '#aaa',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p>&copy; {new Date().getFullYear()} iREVA. All rights reserved.</p>
        <div style={{ marginTop: '10px' }}>
          <a href="/about" style={{ color: '#aaa', margin: '0 8px', textDecoration: 'none' }}>About</a> | 
          <a href="/privacy" style={{ color: '#aaa', margin: '0 8px', textDecoration: 'none' }}>Privacy</a> | 
          <a href="/terms" style={{ color: '#aaa', margin: '0 8px', textDecoration: 'none' }}>Terms</a> | 
          <a href="/contact" style={{ color: '#aaa', margin: '0 8px', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default StaticHome;