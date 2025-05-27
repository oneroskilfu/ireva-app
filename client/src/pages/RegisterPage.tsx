import React, { useState } from 'react';
import { Link } from 'wouter';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registration form submitted:', formData);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1F6FEB 0%, #0A192F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Registration Form Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: 'clamp(30px, 6vw, 50px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
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
              fontSize: '1rem'
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
          
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
            fontWeight: '700',
            color: '#2D2D2D',
            marginBottom: '8px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Join iREVA Today
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            color: '#2D2D2D',
            opacity: '0.7',
            fontFamily: 'Inter, sans-serif'
          }}>
            Start your Nigerian real estate investment journey
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '6px',
                fontFamily: 'Inter, sans-serif'
              }}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E5EAF0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
                onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '6px',
                fontFamily: 'Inter, sans-serif'
              }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E5EAF0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
                onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#2D2D2D',
              marginBottom: '6px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E5EAF0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#2D2D2D',
              marginBottom: '6px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+234 800 000 0000"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E5EAF0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
              onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
            />
          </div>

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '6px',
                fontFamily: 'Inter, sans-serif'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E5EAF0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
                onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#2D2D2D',
                marginBottom: '6px',
                fontFamily: 'Inter, sans-serif'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E5EAF0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1F6FEB'}
                onBlur={(e) => e.target.style.borderColor = '#E5EAF0'}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
              style={{
                marginTop: '2px',
                width: '18px',
                height: '18px',
                accentColor: '#1F6FEB'
              }}
            />
            <label style={{
              fontSize: '0.9rem',
              color: '#2D2D2D',
              lineHeight: '1.5',
              fontFamily: 'Inter, sans-serif'
            }}>
              I agree to iREVA's{' '}
              <Link href="/terms" style={{ color: '#1F6FEB', textDecoration: 'none' }}>
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#1F6FEB', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #1F6FEB 0%, #00B894 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginTop: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(31, 111, 235, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Create My Account
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{
            fontSize: '0.9rem',
            color: '#2D2D2D',
            fontFamily: 'Inter, sans-serif'
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#1F6FEB',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Sign In
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#F5F7FA',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: '#2D2D2D',
            opacity: '0.7',
            marginBottom: '8px',
            fontFamily: 'Inter, sans-serif'
          }}>
            🔒 Your information is secure and encrypted
          </p>
          <p style={{
            fontSize: '0.8rem',
            color: '#2D2D2D',
            opacity: '0.7',
            fontFamily: 'Inter, sans-serif'
          }}>
            Licensed by SEC Nigeria • Regulated Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;