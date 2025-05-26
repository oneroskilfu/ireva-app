// Clean, simple StaticHome component - your beautiful iREVA homepage
import React from 'react';

const StaticHome: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#fafafa' }}>
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
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
            background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
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
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#properties" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>Properties</a>
          <a href="#how-it-works" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>How it Works</a>
          <a href="#about" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>About</a>
          <a 
            href="/auth" 
            style={{
              background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '100px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23008751' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.4
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
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
              background: 'rgba(0, 135, 81, 0.1)',
              color: '#008751',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '32px',
              border: '1px solid rgba(0, 135, 81, 0.2)'
            }}>
              <span>🇳🇬</span>
              Nigeria's Leading Real Estate Platform
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              color: '#1a1a1a',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              Invest in Nigerian<br />
              <span style={{
                background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
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
              fontSize: '1.2rem',
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
              <a 
                href="/signup" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0, 135, 81, 0.25)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 135, 81, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 135, 81, 0.25)';
                }}
              >
                Start Investing
                <span>→</span>
              </a>

              <a 
                href="#properties" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  background: '#fff',
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#008751';
                  e.currentTarget.style.background = '#f8fffe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#fff';
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
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#008751', marginBottom: '4px' }}>₦2.5B+</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Properties Funded</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#008751', marginBottom: '4px' }}>15%</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Average Returns</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#008751', marginBottom: '4px' }}>5,000+</div>
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
                background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ color: '#fff', fontSize: '4rem', opacity: 0.8 }}>🏢</div>
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
                color: '#1a1a1a'
              }}>
                Victoria Island Premium
              </h3>
              
              <p style={{
                color: '#64748b',
                fontSize: '0.95rem',
                marginBottom: '20px'
              }}>
                📍 Victoria Island, Lagos
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#008751' }}>
                    ₦250,000
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Minimum Investment
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>
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
                      background: 'linear-gradient(90deg, #008751, #00d084)'
                    }} />
                  </div>
                </div>
              </div>

              <button style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Invest Now
              </button>
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
              color: '#008751'
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
              color: '#008751'
            }}>
              Verified Property
            </div>
          </div>
        </div>
      </section>

      {/* Featured Nigerian Real Estate Investments */}
      <section id="properties" style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#1e293b',
            letterSpacing: '-0.02em'
          }}>
            Trending Investment Opportunities
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            Carefully vetted properties across Nigeria's prime locations
          </p>

          {/* Property Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
            marginBottom: '50px'
          }}>
            {/* Property 1 - Lagos */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
            }}>
              {/* Property Image */}
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: '#fff',
                  fontSize: '3rem',
                  opacity: '0.8'
                }}>🏢</div>
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

              {/* Property Details */}
              <div style={{ padding: '24px', textAlign: 'left' }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  Victoria Island Premium Towers
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  marginBottom: '16px'
                }}>
                  📍 Victoria Island, Lagos
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#008751' }}>
                      ₦250,000
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                      78% Funded
                    </div>
                    <div style={{
                      width: '80px',
                      height: '6px',
                      background: '#e2e8f0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '78%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #008751, #00d084)'
                      }} />
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #008751 0%, #00d084 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                  Invest Now
                </button>
              </div>
            </div>

            {/* Property 2 - Abuja */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: '#fff',
                  fontSize: '3rem',
                  opacity: '0.8'
                }}>🏘️</div>
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
                  18.5% ROI
                </div>
              </div>
              <div style={{ padding: '24px', textAlign: 'left' }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  Guzape District Luxury Homes
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  marginBottom: '16px'
                }}>
                  📍 Guzape, Abuja
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e40af' }}>
                      ₦500,000
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                      92% Funded
                    </div>
                    <div style={{
                      width: '80px',
                      height: '6px',
                      background: '#e2e8f0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '92%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #1e40af, #3b82f6)'
                      }} />
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                  Invest Now
                </button>
              </div>
            </div>

            {/* Property 3 - Port Harcourt */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{
                height: '240px',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: '#fff',
                  fontSize: '3rem',
                  opacity: '0.8'
                }}>🏭</div>
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
                  22.3% ROI
                </div>
              </div>
              <div style={{ padding: '24px', textAlign: 'left' }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#1e293b'
                }}>
                  Trans Amadi Industrial Estate
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '0.95rem',
                  marginBottom: '16px'
                }}>
                  📍 Trans Amadi, Port Harcourt
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#dc2626' }}>
                      ₦750,000
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Minimum Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                      45% Funded
                    </div>
                    <div style={{
                      width: '80px',
                      height: '6px',
                      background: '#e2e8f0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '45%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #dc2626, #ef4444)'
                      }} />
                    </div>
                  </div>
                </div>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                  Invest Now
                </button>
              </div>
            </div>
          </div>

          {/* View All Properties Button */}
          <a 
            href="/auth" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(30, 41, 59, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(30, 41, 59, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 41, 59, 0.3)';
            }}
          >
            View All Properties
            <span style={{ marginLeft: '8px' }}>→</span>
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