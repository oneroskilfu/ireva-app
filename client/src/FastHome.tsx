// Ultra-fast loading homepage without heavy dependencies
import React from 'react';

const FastHome: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        padding: '20px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            marginBottom: '20px', 
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            Welcome to iREVA
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
            marginBottom: '30px', 
            maxWidth: '600px',
            lineHeight: '1.5'
          }}>
            Nigeria's Premier Real Estate Investment Platform
          </p>
          <div style={{ marginTop: '40px' }}>
            <button style={{
              padding: '15px 35px',
              backgroundColor: '#ff7b00',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginRight: '15px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e06600'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff7b00'}
            >
              Start Investing
            </button>
            <button style={{
              padding: '15px 35px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#1e3a8a';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#fff';
            }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f8fafc',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', 
          marginBottom: '60px', 
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          Why Choose iREVA?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            background: '#fff',
            padding: '40px 30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#ff7b00',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>₦</div>
            <h3 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '1.4rem' }}>
              Fractional Ownership
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
              Invest in premium Nigerian properties with as little as ₦50,000
            </p>
          </div>
          
          <div style={{
            background: '#fff',
            padding: '40px 30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#3730a3',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>🔒</div>
            <h3 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '1.4rem' }}>
              Secure Transactions
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
              Blockchain-secured investments with full transparency
            </p>
          </div>
          
          <div style={{
            background: '#fff',
            padding: '40px 30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#059669',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>📈</div>
            <h3 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '1.4rem' }}>
              High Returns
            </h3>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
              Target returns of 15-25% annually on verified properties
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        color: '#94a3b8',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.5rem' }}>iREVA</h3>
          <p>Building wealth through smart real estate investing</p>
        </div>
        <p style={{ fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} iREVA. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default FastHome;