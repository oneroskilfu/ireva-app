import React from 'react';
import { Link } from 'wouter';

const PropertyListPage: React.FC = () => {
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
        <Link href="/" style={{ textDecoration: 'none' }}>
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
        </Link>
        
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(16px, 3vw, 32px)', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>Home</Link>
          <Link href="/login" style={{
            background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '100px',
        padding: '100px 20px 60px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            Investment Properties
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '20px',
            color: '#0A192F',
            letterSpacing: '-0.02em'
          }}>
            Premium Nigerian Real Estate
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Discover verified investment opportunities across Lagos, Abuja, and Port Harcourt with transparent returns and professional management.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section style={{
        padding: '60px 20px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '40px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              All Properties
            </button>
            <button style={{
              padding: '10px 20px',
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Lagos
            </button>
            <button style={{
              padding: '10px 20px',
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Abuja
            </button>
            <button style={{
              padding: '10px 20px',
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Port Harcourt
            </button>
          </div>

          {/* Properties Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {/* Property 1 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
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
                  19.2% ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1F6FEB',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  FUNDING NOW
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#0A192F'
                }}>
                  Lekki Phase 2 Residences
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Lekki Phase 2, Lagos State
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1F6FEB' }}>
                      ₦500,000
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Min. Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0A192F' }}>
                      85% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        width: '85%',
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
                    fontSize: '0.95rem',
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

            {/* Property 2 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
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
                  16.8% ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#9333EA',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  NEW LISTING
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#0A192F'
                }}>
                  Maitama District Towers
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Maitama, Abuja FCT
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#9333EA' }}>
                      ₦750,000
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Min. Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0A192F' }}>
                      42% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        width: '42%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #9333EA, #EC4899)'
                      }} />
                    </div>
                  </div>
                </div>

                <Link 
                  href="/register"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
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

            {/* Property 3 */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{
                height: '200px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ opacity: 0.8 }}>
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  <rect x="9" y="9" width="6" height="6"/>
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
                  22.1% ROI
                </div>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#F59E0B',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  HOT DEAL
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: '#0A192F'
                }}>
                  GRA Commercial Complex
                </h3>
                
                <p style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  GRA, Port Harcourt
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F59E0B' }}>
                      ₦300,000
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Min. Investment
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0A192F' }}>
                      67% Funded
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        width: '67%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #F59E0B, #EF4444)'
                      }} />
                    </div>
                  </div>
                </div>

                <Link 
                  href="/register"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '0.95rem',
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

          {/* Load More */}
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <button style={{
              padding: '14px 28px',
              background: '#f8fafc',
              color: '#64748b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Load More Properties
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyListPage;