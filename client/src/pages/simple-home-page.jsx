import React from 'react';
import { Link } from 'wouter';

// Simple Navbar Component
const SimpleNavbar = () => {
  const navItems = [
    { title: 'Home', link: '/simple' },
    { title: 'Projects', link: '/projects' },
    { title: 'Transactions', link: '/simple/transactions' },
    { title: 'Settings', link: '/simple/settings' },
    { title: 'Privacy', link: '/simple/privacy-policy' },
    { title: 'Terms', link: '/simple/terms' },
    { title: 'Login', link: '/auth' },
  ];

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '1rem', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      <Link href="/">
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          textDecoration: 'none',
          color: 'black',
          cursor: 'pointer'
        }}>
          iREVA
        </span>
      </Link>
      
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem'
      }}>
        {navItems.map((item, index) => (
          <Link key={index} href={item.link}>
            <span style={{ 
              color: 'black', 
              textDecoration: 'none', 
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Simple Footer Component
const SimpleFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      padding: '3rem 0', 
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1rem'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>iREVA</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Africa's premier real estate investment platform, making property investment accessible for everyone.
            </p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Explore</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/simple"><span style={{ color: '#666', cursor: 'pointer' }}>Home</span></Link>
              <Link href="/projects"><span style={{ color: '#666', cursor: 'pointer' }}>Projects</span></Link>
              <Link href="/about"><span style={{ color: '#666', cursor: 'pointer' }}>About Us</span></Link>
              <Link href="/contact"><span style={{ color: '#666', cursor: 'pointer' }}>Contact</span></Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Investor</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/investor/dashboard"><span style={{ color: '#666', cursor: 'pointer' }}>Dashboard</span></Link>
              <Link href="/simple/transactions"><span style={{ color: '#666', cursor: 'pointer' }}>Transactions</span></Link>
              <Link href="/simple/settings"><span style={{ color: '#666', cursor: 'pointer' }}>Settings</span></Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Legal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/simple/privacy-policy"><span style={{ color: '#666', cursor: 'pointer' }}>Privacy Policy</span></Link>
              <Link href="/simple/terms"><span style={{ color: '#666', cursor: 'pointer' }}>Terms of Service</span></Link>
              <Link href="/legal/investor-risk-disclosure"><span style={{ color: '#666', cursor: 'pointer' }}>Risk Disclosure</span></Link>
            </div>
          </div>
        </div>
        
        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap'
        }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            © {currentYear} iREVA. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/simple/privacy-policy"><span style={{ color: '#666', cursor: 'pointer' }}>Privacy</span></Link>
            <Link href="/simple/terms"><span style={{ color: '#666', cursor: 'pointer' }}>Terms</span></Link>
            <Link href="/legal/cookies-policy"><span style={{ color: '#666', cursor: 'pointer' }}>Cookies</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimpleHomePage = () => {
  return (
    <>
      <SimpleNavbar />
      <div style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <div style={{ 
          backgroundColor: '#4F46E5', 
          color: 'white', 
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              Invest in Africa's Growing Real Estate Market
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '30px',
              maxWidth: '800px',
              margin: '0 auto 30px'
            }}>
              iREVA makes property investment accessible to everyone with secure blockchain technology and fractional ownership.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/properties">
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'white', 
                  color: '#4F46E5', 
                  padding: '12px 24px', 
                  borderRadius: '4px', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}>
                  Explore Properties
                </span>
              </Link>
              <Link href="/auth">
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '4px', 
                  textDecoration: 'none',
                  border: '1px solid white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}>
                  Get Started
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '40px 0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}>
              {[
                { label: 'Properties Listed', value: '120+' },
                { label: 'Registered Investors', value: '5,000+' },
                { label: 'Invested Amount', value: '$25M+' },
                { label: 'Average ROI', value: '12.5%' }
              ].map((stat, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  textAlign: 'center',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <h2 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold', 
                    color: '#4F46E5',
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                  </h2>
                  <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '60px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              textAlign: 'center', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              Why Choose iREVA
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              textAlign: 'center', 
              color: '#6B7280',
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto 40px'
            }}>
              We're revolutionizing real estate investment in Africa with our innovative platform
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px'
            }}>
              {[
                {
                  title: 'Secure Investments',
                  description: 'Blockchain-powered smart contracts ensuring secure and transparent property investments.'
                },
                {
                  title: 'Premium Properties',
                  description: 'Curated selection of high-potential real estate projects across African markets.'
                },
                {
                  title: 'Accessible to Everyone',
                  description: 'Low minimum investment amounts allowing anyone to participate in real estate investing.'
                },
                {
                  title: 'Performance Analytics',
                  description: 'Comprehensive analytics dashboard for tracking investment performance in real-time.'
                }
              ].map((feature, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  padding: '30px', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '16px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#6B7280' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          backgroundColor: '#3730A3', 
          color: 'white', 
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '20px'
            }}>
              Ready to Start Your Investment Journey?
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '30px'
            }}>
              Join thousands of investors building wealth through African real estate
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth">
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'white', 
                  color: '#3730A3', 
                  padding: '14px 28px', 
                  borderRadius: '4px', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}>
                  Create Account
                </span>
              </Link>
              <Link href="/properties">
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'transparent', 
                  color: 'white', 
                  padding: '14px 28px', 
                  borderRadius: '4px', 
                  textDecoration: 'none',
                  border: '1px solid white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}>
                  Browse Properties
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </>
  );
};

export default SimpleHomePage;