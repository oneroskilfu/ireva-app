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
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '60px',
            marginBottom: '60px'
          }}>
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
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
                  fontSize: '1.1rem'
                }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: '400' }}>i</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    fontFamily: 'IBM Plex Mono, monospace', 
                    fontWeight: '400', 
                    fontSize: '1.4rem'
                  }}>i</span>
                  <span style={{ 
                    fontFamily: 'Outfit, sans-serif', 
                    fontWeight: '300', 
                    fontSize: '1.4rem',
                    letterSpacing: '0.5px'
                  }}>REVA</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Nigeria's premier real estate investment platform, democratizing property investment through innovative technology and rigorous due diligence.
              </p>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>Licensed & Regulated by:</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(31, 111, 235, 0.1)',
                    color: '#1F6FEB',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '1px solid rgba(31, 111, 235, 0.2)'
                  }}>SEC Nigeria</span>
                  <span style={{
                    background: 'rgba(31, 111, 235, 0.1)',
                    color: '#1F6FEB',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '1px solid rgba(31, 111, 235, 0.2)'
                  }}>CBN Compliant</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#linkedin" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a href="#twitter" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#instagram" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Investment Column */}
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>Investment</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#properties" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Browse Properties</a>
                <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>How It Works</a>
                <a href="#roi-calculator" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>ROI Calculator</a>
                <a href="#portfolio" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Portfolio Management</a>
                <a href="#market-insights" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Market Insights</a>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>About iREVA</a>
                <a href="#team" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Our Team</a>
                <a href="#careers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Careers</a>
                <a href="#press" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Press & Media</a>
                <a href="#investor-relations" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Investor Relations</a>
              </div>
            </div>

            {/* Support Column */}
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <a href="#help" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Help Center</a>
                <a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>FAQ</a>
                <a href="#contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Contact Us</a>
                <a href="#security" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>Security</a>
                <a href="#api-docs" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.3s ease' }}>API Documentation</a>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>Customer Support</div>
                <div style={{ color: '#1F6FEB', fontWeight: '600', fontSize: '1rem' }}>support@ireva.ng</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Available 24/7</div>
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