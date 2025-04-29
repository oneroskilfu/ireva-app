import React from 'react';
import { Link } from 'wouter';

const MinimalHome = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eaeaea',
        paddingBottom: '15px',
        marginBottom: '30px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '24px' }}>iREVA</div>
        <nav>
          <ul style={{ 
            display: 'flex', 
            listStyle: 'none', 
            gap: '20px', 
            margin: 0, 
            padding: 0 
          }}>
            <li><Link href="/minimal" style={{ color: '#4F46E5', textDecoration: 'none' }}>Home</Link></li>
            <li><Link href="/minimal/properties" style={{ color: '#333', textDecoration: 'none' }}>Properties</Link></li>
            <li><Link href="/minimal/about" style={{ color: '#333', textDecoration: 'none' }}>About</Link></li>
            <li><Link href="/minimal/contact" style={{ color: '#333', textDecoration: 'none' }}>Contact</Link></li>
          </ul>
        </nav>
        <div>
          <button style={{ 
            backgroundColor: '#4F46E5', 
            color: 'white', 
            border: 'none', 
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>Login</button>
        </div>
      </header>

      <main>
        <section style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '40px',
          marginBottom: '60px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '48px', 
              margin: '0 0 20px 0',
              background: 'linear-gradient(90deg, #4F46E5, #9333EA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Invest in African Real Estate</h1>
            <p style={{ 
              fontSize: '18px', 
              lineHeight: '1.6', 
              marginBottom: '30px',
              color: '#666'
            }}>
              iREVA democratizes property investment, making it accessible to everyone through blockchain technology and fractional ownership.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ 
                backgroundColor: '#4F46E5', 
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>Explore Properties</button>
              <button style={{ 
                backgroundColor: 'transparent', 
                color: '#4F46E5',
                border: '1px solid #4F46E5',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>Learn More</button>
            </div>
          </div>
          <div style={{ 
            flex: 1, 
            backgroundColor: '#f3f4f6', 
            height: '400px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#9ca3af',
            fontSize: '18px'
          }}>
            Property Image Placeholder
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            textAlign: 'center',
            marginBottom: '40px'
          }}>Featured Properties</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {[1, 2, 3].map((item) => (
              <div key={item} style={{ 
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  height: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#9ca3af'
                }}>
                  Property {item} Image
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Luxury Villa {item}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                    Lagos, Nigeria
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold' }}>$250,000</div>
                    <button style={{ 
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ 
          backgroundColor: '#f9fafb',
          padding: '60px 40px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{ 
            fontSize: '32px',
            marginTop: 0,
            marginBottom: '20px'
          }}>Why Choose iREVA?</h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginTop: '40px'
          }}>
            <div>
              <div style={{ 
                width: '60px',
                height: '60px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px',
                color: '#4F46E5',
                fontSize: '24px'
              }}>1</div>
              <h3>Blockchain Security</h3>
              <p style={{ color: '#666' }}>
                All investments are secured through blockchain technology and smart contracts.
              </p>
            </div>
            
            <div>
              <div style={{ 
                width: '60px',
                height: '60px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px',
                color: '#4F46E5',
                fontSize: '24px'
              }}>2</div>
              <h3>Fractional Ownership</h3>
              <p style={{ color: '#666' }}>
                Invest with as little as $100 and own a share of premium real estate.
              </p>
            </div>
            
            <div>
              <div style={{ 
                width: '60px',
                height: '60px',
                backgroundColor: '#e0e7ff',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px',
                color: '#4F46E5',
                fontSize: '24px'
              }}>3</div>
              <h3>Regular ROI</h3>
              <p style={{ color: '#666' }}>
                Earn consistent returns from rental income and property appreciation.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ 
        borderTop: '1px solid #eaeaea',
        paddingTop: '30px',
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '15px' }}>iREVA</div>
          <p style={{ color: '#666', maxWidth: '400px' }}>
            Revolutionizing real estate investment in Africa through blockchain technology and fractional ownership.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginTop: 0 }}>Quick Links</h4>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '8px' }}><Link href="/minimal/properties" style={{ color: '#666', textDecoration: 'none' }}>Properties</Link></li>
            <li style={{ marginBottom: '8px' }}><Link href="/minimal/about" style={{ color: '#666', textDecoration: 'none' }}>About Us</Link></li>
            <li style={{ marginBottom: '8px' }}><Link href="/minimal/privacy-policy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li><Link href="/minimal/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms of Service</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ marginTop: 0 }}>Contact</h4>
          <p style={{ color: '#666', margin: '0 0 8px 0' }}>Email: info@ireva.com</p>
          <p style={{ color: '#666', margin: '0 0 8px 0' }}>Phone: +234 800 123 4567</p>
          <p style={{ color: '#666', margin: '0' }}>Lagos, Nigeria</p>
        </div>
      </footer>
      
      <div style={{ 
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eaeaea',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        &copy; {new Date().getFullYear()} iREVA. All rights reserved.
      </div>
    </div>
  );
};

export default MinimalHome;