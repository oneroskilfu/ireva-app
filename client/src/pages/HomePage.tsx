import React from 'react';
import { Link } from 'wouter';

const HomePage: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0A192F', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '12px 16px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(229, 234, 240, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              fontFamily: 'IBM Plex Mono, monospace', 
              fontWeight: '400', 
              fontSize: '1.25rem',
              color: '#0A192F'
            }}>i</span>
            <span style={{ 
              fontFamily: 'Outfit, sans-serif', 
              fontWeight: '300', 
              fontSize: '1.25rem',
              color: '#0A192F',
              letterSpacing: '0.5px'
            }}>REVA</span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(16px, 3vw, 32px)', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="#properties" style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>Properties</a>
          <a href="#how-it-works" style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>How it Works</a>
          <a href="#about" style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>About</a>
          <Link 
            href="/register"
            style={{
              background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '80px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%231F6FEB' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.4
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
          gap: '60px',
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

              <a 
                href="#properties" 
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
              </a>
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

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '60px',
            color: '#0A192F'
          }}>
            Why Choose iREVA?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            {/* Feature 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Verified Properties
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Every property is thoroughly vetted by our team of real estate experts and legal professionals.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <path d="M20 8v6M23 11h-6"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Low Entry Barrier
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Start investing with as little as ₦50,000 and build your real estate portfolio gradually.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px', color: '#0A192F' }}>
                Transparent Returns
              </h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                Track your investments in real-time with detailed ROI reports and predictable returns.
              </p>
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

      {/* Footer */}
      <footer style={{
        background: '#0A192F',
        color: '#fff',
        padding: '60px 20px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  fontFamily: 'IBM Plex Mono, monospace', 
                  fontWeight: '400', 
                  fontSize: '1.25rem'
                }}>i</span>
                <span style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontWeight: '300', 
                  fontSize: '1.25rem',
                  letterSpacing: '0.5px'
                }}>REVA</span>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Nigeria's trusted platform for real estate investment opportunities.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
                <a href="#careers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</a>
                <a href="#contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#compliance" style={{ color: '#94a3b8', textDecoration: 'none' }}>Compliance</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#help" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help Center</a>
                <a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQ</a>
                <a href="#security" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security</a>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '20px',
            color: '#94a3b8',
            fontSize: '0.9rem'
          }}>
            <p>&copy; 2024 iREVA. All rights reserved. | Licensed by Nigerian Securities and Exchange Commission</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;