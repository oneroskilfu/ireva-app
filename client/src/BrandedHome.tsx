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
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a 
            href="/login" 
            style={{
              color: '#2D2D2D',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              padding: '8px 16px',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1F6FEB'}
            onMouseOut={(e) => e.currentTarget.style.color = '#2D2D2D'}
          >
            Login
          </a>
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
        </div>
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

      {/* Features Overview Section */}
      <section style={{
        position: 'absolute',
        top: '100vh',
        left: 0,
        right: 0,
        background: '#F5F7FA',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '20px'
          }}>
            Why Choose iREVA?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: '60px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Advanced technology meets secure real estate investment
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            <div style={{
              background: '#FFFFFF',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💰
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Fractional Investment
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Start investing in premium Nigerian properties with as little as ₦50,000. Own shares in high-value real estate.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🔒
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Multi-Tenant Security
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Bank-grade encryption and multi-layer security protect your investments and personal information.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '40px 30px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Real-Time Monitoring
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Track your portfolio performance, rental income, and property appreciation in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        position: 'absolute',
        top: '180vh',
        left: 0,
        right: 0,
        background: '#FFFFFF',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '20px'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: '60px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Start building wealth in Nigerian real estate in 4 simple steps
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#1F6FEB',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
              }}>
                1
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Select Property
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Browse verified properties in Lagos, Abuja, and Port Harcourt with detailed ROI projections
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#00B894',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
              }}>
                2
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Invest Securely
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Complete KYC verification and invest your desired amount with bank-grade security
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#1F6FEB',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
              }}>
                3
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Track Progress
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Monitor your investment performance and property appreciation through your dashboard
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#00B894',
                borderRadius: '50%',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif'
              }}>
                4
              </div>
              <h3 style={{
                fontSize: '1.3rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '16px'
              }}>
                Earn Returns
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#2D2D2D',
                opacity: '0.7',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Receive quarterly dividends and benefit from property appreciation over time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        position: 'absolute',
        top: '260vh',
        left: 0,
        right: 0,
        background: '#F5F7FA',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '20px'
          }}>
            Investor Success Stories
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: '60px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Real results from real investors building wealth through iREVA
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '40px' }}>
            <div style={{
              background: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  color: '#00B894',
                  fontSize: '1.2rem',
                  marginBottom: '16px'
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#2D2D2D',
                  lineHeight: '1.6',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '24px'
                }}>
                  "I started with ₦200,000 in a Lagos residential project through iREVA. Within 18 months, I've earned ₦45,000 in dividends and my property value appreciated by 12%. The platform made real estate investment accessible for someone like me."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    AS
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#2D2D2D',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Adebayo Sanni
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Software Engineer, Lagos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  color: '#00B894',
                  fontSize: '1.2rem',
                  marginBottom: '16px'
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#2D2D2D',
                  lineHeight: '1.6',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '24px'
                }}>
                  "As a diaspora Nigerian, iREVA gave me the perfect opportunity to invest back home. I've diversified across 3 properties in Abuja and earned consistent returns. The transparency and regular updates give me complete confidence."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    CN
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#2D2D2D',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Chioma Nwosu
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Business Consultant, Toronto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section style={{
        position: 'absolute',
        top: '340vh',
        left: 0,
        right: 0,
        background: '#FFFFFF',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              color: '#2D2D2D',
              marginBottom: '20px'
            }}>
              Featured Investment Opportunities
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#2D2D2D',
              opacity: '0.7',
              fontFamily: 'Inter, sans-serif'
            }}>
              Current and completed projects with verified returns
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E5EAF0'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '3rem'
              }}>
                🏢
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#00B894',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  FULLY FUNDED
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '8px'
                }}>
                  Victoria Island Luxury Apartments
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#2D2D2D',
                  opacity: '0.6',
                  marginBottom: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Lagos • 24 Units • Premium Location
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Total Value
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2D2D2D',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      ₦850M
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Annual ROI
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#00B894',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      16.5%
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#F5F7FA',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#2D2D2D',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  ✅ Project completed • Generating rental income
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E5EAF0'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #0A192F 0%, #1F6FEB 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '3rem'
              }}>
                🏘️
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#1F6FEB',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  85% FUNDED
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '8px'
                }}>
                  Abuja Smart City Residences
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#2D2D2D',
                  opacity: '0.6',
                  marginBottom: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Abuja • 48 Units • Smart Home Technology
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Total Value
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2D2D2D',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      ₦1.2B
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Projected ROI
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#1F6FEB',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      18.2%
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#F0F8FF',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#1F6FEB',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  🚧 Under construction • ₦180M remaining
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E5EAF0'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #00B894 0%, #17C3B2 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '3rem'
              }}>
                🏪
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#17C3B2',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  LAUNCHING SOON
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '8px'
                }}>
                  Port Harcourt Commercial Plaza
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#2D2D2D',
                  opacity: '0.6',
                  marginBottom: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Port Harcourt • Mixed Use • High Traffic Area
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Total Value
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#2D2D2D',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      ₦650M
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#2D2D2D',
                      opacity: '0.6',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      Target ROI
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#00B894',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      14.8%
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#F0FDF9',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#00B894',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  📅 Early bird access available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section style={{
        position: 'absolute',
        top: '440vh',
        left: 0,
        right: 0,
        background: '#0A192F',
        padding: '80px 24px',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            Security & Compliance
          </h2>
          <p style={{
            fontSize: '1.2rem',
            opacity: '0.8',
            marginBottom: '60px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Your investments are protected by industry-leading security and regulatory compliance
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 30px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🛡️
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Regulatory Compliance
              </h3>
              <p style={{
                fontSize: '1rem',
                opacity: '0.8',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px'
              }}>
                Fully licensed and regulated by Nigerian Securities and Exchange Commission (SEC) and Corporate Affairs Commission (CAC).
              </p>
              <div style={{
                background: 'rgba(0, 184, 148, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                SEC Licensed
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 30px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🔐
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                KYC & AML Protection
              </h3>
              <p style={{
                fontSize: '1rem',
                opacity: '0.8',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px'
              }}>
                Comprehensive Know Your Customer and Anti-Money Laundering procedures protect all investors and transactions.
              </p>
              <div style={{
                background: 'rgba(31, 111, 235, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Bank-Grade Security
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '40px 30px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🏦
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Secure Fund Management
              </h3>
              <p style={{
                fontSize: '1rem',
                opacity: '0.8',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px'
              }}>
                All investor funds are held in segregated accounts with top-tier Nigerian banks and protected by insurance coverage.
              </p>
              <div style={{
                background: 'rgba(23, 195, 178, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Insured Deposits
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '60px',
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Regulatory Partners & Certifications
            </h4>
            <p style={{
              fontSize: '1rem',
              opacity: '0.8',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px'
            }}>
              Licensed by SEC Nigeria • Registered with CAC • Member of Real Estate Developers Association of Nigeria (REDAN)
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              opacity: '0.7'
            }}>
              <span>🏛️ SEC License: REG/2024/IRV001</span>
              <span>📋 CAC Registration: RC 1234567</span>
              <span>🏗️ REDAN Member: RDN/2024/789</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandedHome;