import React from 'react';

const ResponsiveHome: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#2D2D2D' }}>
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
              color: '#2D2D2D'
            }}>i</span>
            <span style={{ 
              fontFamily: 'Outfit, sans-serif', 
              fontWeight: '300', 
              fontSize: '1.25rem',
              color: '#2D2D2D',
              letterSpacing: '0.5px'
            }}>REVA</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a 
            href="/login" 
            style={{
              color: '#2D2D2D',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              padding: '6px 12px',
              fontSize: '0.9rem',
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
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '0.9rem',
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

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1F6FEB 0%, #0A192F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 60px',
        color: '#FFFFFF'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div style={{
            background: 'rgba(0, 184, 148, 0.2)',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            marginBottom: '24px',
            display: 'inline-block',
            border: '1px solid rgba(0, 184, 148, 0.3)'
          }}>
            🇳🇬 Nigeria's Premier Real Estate Investment Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}>
            Build Wealth Through<br />Nigerian Real Estate
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            marginBottom: '32px',
            opacity: '0.9',
            lineHeight: '1.6',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '400',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Access verified property investments across Lagos, Abuja, and Port Harcourt. Transparent returns, secure transactions, world-class platform.
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            <a 
              href="/auth" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 36px)',
                background: '#00B894',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
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
                padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 36px)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '500',
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
            maxWidth: '500px',
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: 'clamp(16px, 4vw, 24px)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'clamp(1.2rem, 4vw, 2rem)', 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700', 
                marginBottom: '4px',
                color: '#00B894'
              }}>₦2.5B+</div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', 
                opacity: '0.8',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400'
              }}>Properties Funded</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'clamp(1.2rem, 4vw, 2rem)', 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700', 
                marginBottom: '4px',
                color: '#00B894'
              }}>15%</div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', 
                opacity: '0.8',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400'
              }}>Average Returns</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 'clamp(1.2rem, 4vw, 2rem)', 
                fontFamily: 'Inter, sans-serif',
                fontWeight: '700', 
                marginBottom: '4px',
                color: '#00B894'
              }}>5,000+</div>
              <div style={{ 
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', 
                opacity: '0.8',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400'
              }}>Active Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section style={{
        background: '#F5F7FA',
        padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 24px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '16px'
          }}>
            Why Choose iREVA?
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: 'clamp(40px, 8vw, 60px)',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            margin: '0 auto clamp(40px, 8vw, 60px)'
          }}>
            Advanced technology meets secure real estate investment
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 'clamp(20px, 5vw, 40px)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              background: '#FFFFFF',
              padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 'clamp(50px, 8vw, 60px)',
                height: 'clamp(50px, 8vw, 60px)',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto clamp(16px, 4vw, 24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(20px, 4vw, 24px)'
              }}>
                💰
              </div>
              <h3 style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '12px'
              }}>
                Fractional Investment
              </h3>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
              padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 'clamp(50px, 8vw, 60px)',
                height: 'clamp(50px, 8vw, 60px)',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto clamp(16px, 4vw, 24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(20px, 4vw, 24px)'
              }}>
                🔒
              </div>
              <h3 style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '12px'
              }}>
                Multi-Tenant Security
              </h3>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
              padding: 'clamp(24px, 5vw, 40px) clamp(20px, 4vw, 30px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 'clamp(50px, 8vw, 60px)',
                height: 'clamp(50px, 8vw, 60px)',
                background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                borderRadius: '16px',
                margin: '0 auto clamp(16px, 4vw, 24px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(20px, 4vw, 24px)'
              }}>
                📊
              </div>
              <h3 style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '12px'
              }}>
                Real-Time Monitoring
              </h3>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
        background: '#FFFFFF',
        padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 24px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '16px'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: 'clamp(40px, 8vw, 60px)',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            margin: '0 auto clamp(40px, 8vw, 60px)'
          }}>
            Start building wealth in Nigerian real estate in 4 simple steps
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'clamp(24px, 6vw, 40px)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              { num: '1', title: 'Select Property', desc: 'Browse verified properties in Lagos, Abuja, and Port Harcourt with detailed ROI projections', color: '#1F6FEB' },
              { num: '2', title: 'Invest Securely', desc: 'Complete KYC verification and invest your desired amount with bank-grade security', color: '#00B894' },
              { num: '3', title: 'Track Progress', desc: 'Monitor your investment performance and property appreciation through your dashboard', color: '#1F6FEB' },
              { num: '4', title: 'Earn Returns', desc: 'Receive quarterly dividends and benefit from property appreciation over time', color: '#00B894' }
            ].map((step, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 'clamp(60px, 10vw, 80px)',
                  height: 'clamp(60px, 10vw, 80px)',
                  background: step.color,
                  borderRadius: '50%',
                  margin: '0 auto clamp(16px, 4vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  fontWeight: '700',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  marginBottom: '12px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                  color: '#2D2D2D',
                  opacity: '0.7',
                  lineHeight: '1.6',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        background: '#F5F7FA',
        padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 24px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '16px'
          }}>
            Investor Success Stories
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: 'clamp(40px, 8vw, 60px)',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            margin: '0 auto clamp(40px, 8vw, 60px)'
          }}>
            Real results from real investors building wealth through iREVA
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 'clamp(20px, 5vw, 40px)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              background: '#FFFFFF',
              padding: 'clamp(24px, 5vw, 40px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                color: '#00B894',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                marginBottom: '12px'
              }}>
                ⭐⭐⭐⭐⭐
              </div>
              <p style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: '#2D2D2D',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px'
              }}>
                "I started with ₦200,000 in a Lagos residential project through iREVA. Within 18 months, I've earned ₦45,000 in dividends and my property value appreciated by 12%. The platform made real estate investment accessible for someone like me."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(40px, 6vw, 50px)',
                  height: 'clamp(40px, 6vw, 50px)',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)'
                }}>
                  AS
                </div>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: '#2D2D2D',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                  }}>
                    Adebayo Sanni
                  </div>
                  <div style={{
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                    color: '#2D2D2D',
                    opacity: '0.6',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Software Engineer, Lagos
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: 'clamp(24px, 5vw, 40px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                color: '#00B894',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                marginBottom: '12px'
              }}>
                ⭐⭐⭐⭐⭐
              </div>
              <p style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: '#2D2D2D',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px'
              }}>
                "As a diaspora Nigerian, iREVA gave me the perfect opportunity to invest back home. I've diversified across 3 properties in Abuja and earned consistent returns. The transparency and regular updates give me complete confidence."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 'clamp(40px, 6vw, 50px)',
                  height: 'clamp(40px, 6vw, 50px)',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)'
                }}>
                  CN
                </div>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: '#2D2D2D',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                  }}>
                    Chioma Nwosu
                  </div>
                  <div style={{
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
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
      </section>

      {/* Featured Projects Section */}
      <section id="properties" style={{
        background: '#FFFFFF',
        padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 24px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 60px)' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '700',
              color: '#2D2D2D',
              marginBottom: '16px'
            }}>
              Featured Investment Opportunities
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              color: '#2D2D2D',
              opacity: '0.7',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Current and completed projects with verified returns
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'clamp(20px, 4vw, 30px)'
          }}>
            {[
              { 
                icon: '🏢', 
                title: 'Victoria Island Luxury Apartments', 
                location: 'Lagos • 24 Units • Premium Location',
                value: '₦850M',
                roi: '16.5%',
                status: 'FULLY FUNDED',
                statusColor: '#00B894',
                bgGradient: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                note: '✅ Project completed • Generating rental income'
              },
              { 
                icon: '🏘️', 
                title: 'Abuja Smart City Residences', 
                location: 'Abuja • 48 Units • Smart Home Technology',
                value: '₦1.2B',
                roi: '18.2%',
                status: '85% FUNDED',
                statusColor: '#1F6FEB',
                bgGradient: 'linear-gradient(135deg, #0A192F 0%, #1F6FEB 100%)',
                note: '🚧 Under construction • ₦180M remaining'
              },
              { 
                icon: '🏪', 
                title: 'Port Harcourt Commercial Plaza', 
                location: 'Port Harcourt • Mixed Use • High Traffic Area',
                value: '₦650M',
                roi: '14.8%',
                status: 'LAUNCHING SOON',
                statusColor: '#17C3B2',
                bgGradient: 'linear-gradient(135deg, #00B894 0%, #17C3B2 100%)',
                note: '📅 Early bird access available'
              }
            ].map((project, index) => (
              <div key={index} style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E5EAF0'
              }}>
                <div style={{
                  height: 'clamp(150px, 25vw, 200px)',
                  background: project.bgGradient,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: 'clamp(2rem, 5vw, 3rem)'
                }}>
                  {project.icon}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: project.statusColor,
                    color: '#FFFFFF',
                    padding: '4px 8px',
                    borderRadius: '16px',
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {project.status}
                  </div>
                </div>
                <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    color: '#2D2D2D',
                    marginBottom: '6px'
                  }}>
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                    color: '#2D2D2D',
                    opacity: '0.6',
                    marginBottom: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {project.location}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                        color: '#2D2D2D',
                        opacity: '0.6',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        Total Value
                      </div>
                      <div style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        fontWeight: '700',
                        color: '#2D2D2D',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {project.value}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                        color: '#2D2D2D',
                        opacity: '0.6',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {index === 0 ? 'Annual ROI' : index === 1 ? 'Projected ROI' : 'Target ROI'}
                      </div>
                      <div style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        fontWeight: '700',
                        color: project.statusColor,
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {project.roi}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: index === 0 ? '#F5F7FA' : index === 1 ? '#F0F8FF' : '#F0FDF9',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                    color: project.statusColor,
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {project.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section style={{
        background: '#0A192F',
        padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 24px)',
        color: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            Security & Compliance
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            opacity: '0.8',
            marginBottom: 'clamp(40px, 8vw, 60px)',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            margin: '0 auto clamp(40px, 8vw, 60px)'
          }}>
            Your investments are protected by industry-leading security and regulatory compliance
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'clamp(24px, 5vw, 40px)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {[
              {
                icon: '🛡️',
                title: 'Regulatory Compliance',
                desc: 'Fully licensed and regulated by Nigerian Securities and Exchange Commission (SEC) and Corporate Affairs Commission (CAC).',
                badge: 'SEC Licensed'
              },
              {
                icon: '🔐',
                title: 'KYC & AML Protection',
                desc: 'Comprehensive Know Your Customer and Anti-Money Laundering procedures protect all investors and transactions.',
                badge: 'Bank-Grade Security'
              },
              {
                icon: '🏦',
                title: 'Secure Fund Management',
                desc: 'All investor funds are held in segregated accounts with top-tier Nigerian banks and protected by insurance coverage.',
                badge: 'Insured Deposits'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 30px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 'clamp(50px, 8vw, 60px)',
                  height: 'clamp(50px, 8vw, 60px)',
                  background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
                  borderRadius: '16px',
                  margin: '0 auto clamp(16px, 4vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(20px, 4vw, 24px)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  opacity: '0.8',
                  lineHeight: '1.6',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '16px'
                }}>
                  {feature.desc}
                </p>
                <div style={{
                  background: index === 0 ? 'rgba(0, 184, 148, 0.2)' : index === 1 ? 'rgba(31, 111, 235, 0.2)' : 'rgba(23, 195, 178, 0.2)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  display: 'inline-block',
                  fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                  fontWeight: '500'
                }}>
                  {feature.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2D2D2D',
        color: '#FFFFFF',
        padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 24px) clamp(20px, 4vw, 30px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(30px, 6vw, 50px)',
            marginBottom: 'clamp(30px, 6vw, 40px)'
          }}>
            {/* Company Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                opacity: '0.8',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '16px'
              }}>
                Nigeria's premier real estate investment platform. Building wealth through verified property investments across Lagos, Abuja, and Port Harcourt.
              </p>
              <div style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                opacity: '0.6',
                fontFamily: 'Inter, sans-serif'
              }}>
                Licensed by SEC Nigeria • RC 1234567
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['How It Works', 'Featured Properties', 'Investment Calculator', 'Success Stories', 'Security & Compliance'].map((link, index) => (
                  <a key={index} href="#" style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    opacity: '0.8',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Legal & Support
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Help Center', 'Contact Support'].map((link, index) => (
                  <a key={index} href="#" style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    opacity: '0.8',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Contact Info
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  opacity: '0.8',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  📧 hello@ireva.ng
                </div>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  opacity: '0.8',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  📱 +234 (0) 800 IREVA-NG
                </div>
                <div style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  opacity: '0.8',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  📍 Victoria Island, Lagos, Nigeria
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 'clamp(20px, 4vw, 30px)',
            marginBottom: 'clamp(20px, 4vw, 30px)'
          }}>
            <h4 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Privacy & Data Protection
            </h4>
            <p style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
              opacity: '0.8',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif'
            }}>
              iREVA is committed to protecting your privacy and personal data. We comply with Nigerian Data Protection Regulation (NDPR) and international privacy standards. Your investment information is encrypted and securely stored. We never share your personal data with third parties without your explicit consent. For detailed information about how we collect, use, and protect your data, please read our comprehensive Privacy Policy.
            </p>
          </div>

          {/* Bottom Footer */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: 'clamp(16px, 3vw, 20px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{
              fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
              opacity: '0.6',
              fontFamily: 'Inter, sans-serif'
            }}>
              © 2025 iREVA. All rights reserved. Investment risks apply.
            </div>
            <div style={{
              fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
              opacity: '0.6',
              fontFamily: 'Inter, sans-serif'
            }}>
              Made with ❤️ in Nigeria
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveHome;