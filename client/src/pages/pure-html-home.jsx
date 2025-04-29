// A completely standalone homepage without any external dependencies
import React from 'react';

const PureHTMLHome = () => {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', 
      margin: 0,
      padding: 0,
      lineHeight: 1.5,
      color: '#333'
    }}>
      {/* Hero Section */}
      <header style={{ 
        backgroundColor: '#1a365d', 
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
          }}>
            Building Wealth Together: Real Estate, Reimagined.
          </h1>
          <p style={{ 
            fontSize: '1.25rem',
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            Fractional investment in premium real estate projects, powered by innovation and trust.
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button style={{ 
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              Get Started
            </button>
            <button style={{ 
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              See Opportunities
            </button>
          </div>
        </div>
      </header>

      {/* Trust Section */}
      <section style={{ 
        padding: '80px 20px', 
        textAlign: 'center',
        backgroundColor: 'white' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '1rem' 
          }}>
            Trusted By Thousands
          </h2>
          <p style={{ 
            fontSize: '1.25rem',
            marginBottom: '2rem',
            color: '#666'
          }}>
            Over 5,000+ active investors building wealth with iREVA.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        padding: '80px 20px', 
        backgroundColor: '#f8fafc',
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '2rem' 
          }}>
            How It Works
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px',
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            {[
              "Sign Up and Complete KYC",
              "Browse Verified Investment Projects",
              "Invest and Track ROI",
              "Withdraw or Reinvest Earnings",
              "Manage Crypto Wallet"
            ].map((step, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                padding: '30px 20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #eee'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#333'
                }}>
                  Step {index + 1}
                </h3>
                <p style={{ color: '#666' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '80px 20px', 
        backgroundColor: 'white',
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '2rem' 
          }}>
            Key Features
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px',
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            {[
              { 
                title: "Own Real Estate with Ease", 
                desc: "Direct ownership shares, no huge upfront capital."
              },
              { 
                title: "Crypto-Enabled Investments", 
                desc: "Optional deposits via stablecoins and Bitcoin."
              },
              { 
                title: "Smart Contract Escrow", 
                desc: "Secure transaction settlements powered by blockchain."
              },
              { 
                title: "Seamless Mobile Experience", 
                desc: "Invest and monitor anywhere with our PWA app."
              },
              { 
                title: "Fully Regulated Compliance", 
                desc: "KYC, AML, and legal protections in place."
              },
              { 
                title: "Transparent Reporting", 
                desc: "Real-time dashboards and project updates."
              }
            ].map((feature, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                padding: '30px 20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: '1px solid #eee',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#333',
                  position: 'relative',
                  paddingBottom: '8px'
                }}>
                  {feature.title}
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    width: '40px',
                    height: '3px',
                    backgroundColor: '#4F46E5'
                  }}></span>
                </h3>
                <p style={{ color: '#666' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ 
        padding: '80px 20px', 
        backgroundColor: '#4F46E5',
        color: 'white',
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '1rem' 
          }}>
            Ready to Start Your Investment Journey?
          </h2>
          <p style={{ 
            fontSize: '1.25rem',
            marginBottom: '2rem'
          }}>
            Join our growing community of investors and get access to exclusive property deals.
          </p>
          <button style={{ 
            backgroundColor: 'white',
            color: '#4F46E5',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 20px 40px',
        backgroundColor: '#111827',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                marginBottom: '1.5rem'
              }}>
                iREVA
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                Building a better future through smart real estate investments.
              </p>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Platform
              </h3>
              <ul style={{ padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>How It Works</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Properties</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Company
              </h3>
              <ul style={{ padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>About Us</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Team</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Press</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Legal
              </h3>
              <ul style={{ padding: 0, listStyle: 'none' }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Disclaimer</a>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Compliance</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Contact
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '8px' }}>support@ireva.com</p>
              <p style={{ color: '#9ca3af', marginBottom: '8px' }}>+234 000 0000</p>
              <p style={{ color: '#9ca3af', marginBottom: '8px' }}>Lagos, Nigeria</p>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '20px',
            textAlign: 'center' 
          }}>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              © {new Date().getFullYear()} iREVA Investment Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PureHTMLHome;