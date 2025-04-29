import React from 'react';

const styles = {
  app: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  navbar: {
    backgroundColor: 'white', 
    padding: '1rem', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  navbarContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  logo: {
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#1F2937',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem'
  },
  navLink: {
    textDecoration: 'none',
    color: '#4B5563',
    fontWeight: 500
  },
  getStartedButton: {
    backgroundColor: '#4F46E5',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    paddingTop: '5rem',
    flex: 1
  },
  hero: {
    backgroundColor: '#4F46E5',
    backgroundImage: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    color: 'white',
    borderRadius: '1rem',
    padding: '4rem 2rem',
    marginTop: '4rem',
    marginBottom: '3rem',
    textAlign: 'center'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '1rem',
    lineHeight: 1.2
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem'
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '1rem',
    textDecoration: 'none',
    display: 'inline-block'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: '1px solid white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '1rem',
    textDecoration: 'none',
    display: 'inline-block'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '2rem',
    marginTop: '4rem'
  },
  cardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '350px',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },
  cardLocation: {
    color: '#6B7280',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  cardStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem'
  },
  cardStatBox: {
    
  },
  cardStatLabel: {
    color: '#6B7280',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    marginBottom: '0.25rem'
  },
  cardStatValue: {
    color: '#4F46E5',
    fontWeight: 600,
    fontSize: '1.125rem'
  },
  cardStatValueGreen: {
    color: '#10B981',
    fontWeight: 600,
    fontSize: '1.125rem'
  },
  cardButton: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #4F46E5',
    color: '#4F46E5',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block'
  },
  howItWorksSection: {
    backgroundColor: '#f5f7ff',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    marginTop: '4rem',
    marginBottom: '3rem'
  },
  howItWorksSteps: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  stepItem: {
    textAlign: 'center',
    flex: '1 1 300px',
    maxWidth: '350px'
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4F46E5',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 1rem',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem'
  },
  stepDescription: {
    color: '#6B7280'
  },
  ctaSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: '1rem'
  },
  ctaSubtitle: {
    fontSize: '1.25rem',
    color: '#6B7280',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem'
  },
  footer: {
    backgroundColor: '#4F46E5',
    color: 'white',
    padding: '1.5rem',
    textAlign: 'center',
    marginTop: 'auto'
  }
};

const featuredProperties = [
  {
    id: 1,
    title: 'Luxury Apartment Complex',
    location: 'Lagos, Nigeria',
    type: 'Residential',
    minInvestment: '$1,000',
    expectedROI: '12%',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3'
  },
  {
    id: 2,
    title: 'Commercial Plaza',
    location: 'Accra, Ghana',
    type: 'Commercial',
    minInvestment: '$2,500',
    expectedROI: '14%',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3'
  },
  {
    id: 3,
    title: 'Residential Development',
    location: 'Nairobi, Kenya',
    type: 'Mixed-Use',
    minInvestment: '$800',
    expectedROI: '10%',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3'
  }
];

export default function MinimalIREVAHome() {
  return (
    <div style={styles.app}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <a href="/" style={styles.logo}>iREVA</a>
          <div style={styles.navLinks}>
            <a href="/projects" style={styles.navLink}>Properties</a>
            <a href="/crypto-education" style={styles.navLink}>Crypto Education</a>
            <button style={styles.getStartedButton}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Invest in African Real Estate</h1>
          <p style={styles.heroSubtitle}>Access premium property investments with as little as $100</p>
          <div style={styles.buttonContainer}>
            <a href="/projects" style={styles.primaryButton}>Browse Properties</a>
            <a href="/auth" style={styles.secondaryButton}>Get Started</a>
          </div>
        </div>

        {/* Featured Properties */}
        <h2 style={styles.sectionTitle}>Featured Investment Opportunities</h2>
        <div style={styles.cardsContainer}>
          {featuredProperties.map((property) => (
            <div key={property.id} style={styles.card}>
              <img 
                src={property.imageUrl} 
                alt={property.title} 
                style={styles.cardImage}
              />
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{property.title}</h3>
                <p style={styles.cardLocation}>{property.location} • {property.type}</p>
                <div style={styles.cardStats}>
                  <div style={styles.cardStatBox}>
                    <p style={styles.cardStatLabel}>Min. Investment</p>
                    <p style={styles.cardStatValue}>{property.minInvestment}</p>
                  </div>
                  <div style={styles.cardStatBox}>
                    <p style={styles.cardStatLabel}>Expected ROI</p>
                    <p style={styles.cardStatValueGreen}>{property.expectedROI}</p>
                  </div>
                </div>
                <a 
                  href={`/property/${property.id}`} 
                  style={styles.cardButton}
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <a href="/projects" style={styles.primaryButton}>See All Properties</a>
        </div>

        {/* How It Works */}
        <div style={styles.howItWorksSection}>
          <h2 style={styles.sectionTitle}>How iREVA Works</h2>
          <div style={styles.howItWorksSteps}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Browse Properties</h3>
              <p style={styles.stepDescription}>
                Explore our curated selection of premium real estate investment opportunities across Africa.
              </p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>Invest Securely</h3>
              <p style={styles.stepDescription}>
                Use our secure platform to invest in properties using various payment methods, including cryptocurrency.
              </p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Track Returns</h3>
              <p style={styles.stepDescription}>
                Monitor your investment portfolio and receive regular returns directly to your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Ready to Start Investing?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of investors building wealth through African real estate
          </p>
          <div style={styles.buttonContainer}>
            <a href="/auth" style={styles.primaryButton}>Create Account</a>
            <a href="/projects" style={styles.secondaryButton}>Browse Properties</a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} iREVA - Real Estate Investment Platform
      </footer>
    </div>
  );
}