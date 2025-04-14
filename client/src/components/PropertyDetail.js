import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { isInvestor } from '../utils/auth';

const PropertyDetail = ({ propertyId }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [investment, setInvestment] = useState({
    amount: 100000, // Default minimum investment (₦100,000)
    slots: 1
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/properties/${propertyId}`);
        setProperty(response.data);
        // Set the minimum investment amount from the property data
        if (response.data.minimumInvestment) {
          setInvestment(prev => ({
            ...prev,
            amount: response.data.minimumInvestment
          }));
        }
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError('Failed to load property details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleInvestmentChange = (e) => {
    const { name, value } = e.target;
    let newValue = parseFloat(value);

    // Ensure amount is at least the minimum investment
    if (name === 'amount' && property && newValue < property.minimumInvestment) {
      newValue = property.minimumInvestment;
    }

    // Calculate slots based on amount or vice versa
    let newInvestment = { ...investment, [name]: newValue };
    if (name === 'amount' && property) {
      newInvestment.slots = Math.floor(newValue / property.minimumInvestment);
    } else if (name === 'slots' && property) {
      newInvestment.amount = newValue * property.minimumInvestment;
    }

    setInvestment(newInvestment);
  };

  const handleInvestment = async () => {
    if (!isInvestor()) {
      alert('You need to be logged in as an investor to make investments.');
      return;
    }

    try {
      const response = await API.post('/investments', {
        propertyId: property.id,
        amount: investment.amount,
        slots: investment.slots
      });
      
      alert('Investment successful! Redirecting to your portfolio...');
      // Redirect to portfolio or show success message
    } catch (err) {
      console.error('Investment failed:', err);
      alert('Investment failed: ' + (err.response?.data?.message || 'Please try again later'));
    }
  };

  // Format currency (Naira)
  const formatCurrency = (amount) => {
    return `₦${parseInt(amount).toLocaleString('en-NG')}`;
  };

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!property) {
    return <div className="error">Property not found</div>;
  }

  return (
    <div className="property-detail">
      <div className="property-header">
        <div className="property-images">
          <img 
            src={property.imageUrl || 'https://via.placeholder.com/800x500'} 
            alt={property.name} 
            className="main-image"
          />
          <div className="image-thumbnails">
            {property.additionalImages && JSON.parse(property.additionalImages).map((img, index) => (
              <img key={index} src={img} alt={`${property.name} ${index + 1}`} />
            ))}
          </div>
        </div>
        
        <div className="property-summary">
          <h1>{property.name}</h1>
          <p className="property-location">{property.location}</p>
          <div className="property-badges">
            <span className="badge property-type">{property.type}</span>
            <span className="badge risk-rating">{property.riskRating || 'Medium'} Risk</span>
          </div>
          
          <div className="property-key-stats">
            <div className="stat">
              <span className="stat-label">Target Return</span>
              <span className="stat-value">{property.targetReturn}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Min. Investment</span>
              <span className="stat-value">{formatCurrency(property.minimumInvestment)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Term</span>
              <span className="stat-value">{property.term} months</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Funding</span>
              <span className="stat-value">{formatCurrency(property.totalFunding)}</span>
            </div>
          </div>
          
          <div className="funding-progress">
            <div className="progress-label">
              <span>{formatCurrency(property.currentFunding)} raised of {formatCurrency(property.totalFunding)}</span>
              <span>{Math.round((property.currentFunding / property.totalFunding) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min(100, Math.round((property.currentFunding / property.totalFunding) * 100))}%` }}
              ></div>
            </div>
            <div className="funding-meta">
              <span>{property.numberOfInvestors} investors</span>
              <span>{property.daysLeft} days left</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="property-content">
        <div className="property-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
          >
            Financials
          </button>
          <button 
            className={`tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            Location
          </button>
          <button 
            className={`tab ${activeTab === 'developer' ? 'active' : ''}`}
            onClick={() => setActiveTab('developer')}
          >
            Developer
          </button>
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div>
              <h2>Property Overview</h2>
              <p>{property.description}</p>
              
              <div className="property-features">
                <h3>Key Features</h3>
                <ul>
                  {property.features && JSON.parse(property.features).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="property-amenities">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {property.amenities && JSON.parse(property.amenities).map((amenity, index) => (
                    <div key={index} className="amenity-item">{amenity}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'financials' && (
            <div>
              <h2>Financial Projections</h2>
              
              <div className="financial-metrics">
                <div className="metric">
                  <h3>Projected IRR</h3>
                  <p className="metric-value">{property.projectedIrr || property.targetReturn}%</p>
                </div>
                <div className="metric">
                  <h3>Cash Yield</h3>
                  <p className="metric-value">{property.projectedCashYield || '7.5'}%</p>
                </div>
                <div className="metric">
                  <h3>Appreciation</h3>
                  <p className="metric-value">{property.projectedAppreciation || '5.2'}%</p>
                </div>
                <div className="metric">
                  <h3>Total Return</h3>
                  <p className="metric-value">{property.projectedTotalReturn || '35'}%</p>
                </div>
              </div>
              
              <div className="risk-assessment">
                <h3>Risk Assessment</h3>
                <p className="risk-rating">{property.riskRating || 'Medium'} Risk</p>
                <p>{property.riskDescription || 'This investment carries a medium level of risk with moderate exposure to market fluctuations. The property is in a well-established neighborhood with stable growth potential.'}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'location' && (
            <div>
              <h2>Location</h2>
              <p className="location-address">
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </p>
              
              <div className="location-map">
                {/* Map would be displayed here */}
                <div className="map-placeholder">
                  Map view would be displayed here
                </div>
              </div>
              
              <div className="neighborhood-info">
                <h3>Neighborhood</h3>
                <p>{property.neighborhoodDescription || 'Information about the neighborhood not available.'}</p>
              </div>
            </div>
          )}
          
          {activeTab === 'developer' && (
            <div>
              <h2>Developer Information</h2>
              
              <div className="developer-info">
                {property.developerLogoUrl && (
                  <img src={property.developerLogoUrl} alt={property.developerName} className="developer-logo" />
                )}
                <h3>{property.developerName}</h3>
                <p>{property.developerDescription || 'Developer information not available.'}</p>
              </div>
              
              <div className="project-timeline">
                <h3>Project Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Acquisition</h4>
                      <p>{new Date(property.acquisitionDate).toLocaleDateString() || 'TBD'}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Construction</h4>
                      <p>{property.constructionStartDate ? new Date(property.constructionStartDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>Completion</h4>
                      <p>{property.estimatedCompletionDate ? new Date(property.estimatedCompletionDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div>
              <h2>Documents</h2>
              
              <div className="document-list">
                {property.documentUrls ? (
                  JSON.parse(property.documentUrls).map((doc, index) => (
                    <div key={index} className="document-item">
                      <span className="document-icon">📄</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                    </div>
                  ))
                ) : (
                  <p>No documents available for this property.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="investment-section">
        <h2>Invest in this Property</h2>
        
        <div className="investment-calculator">
          <div className="calculator-row">
            <label>Amount (₦)</label>
            <input 
              type="number" 
              name="amount"
              min={property.minimumInvestment}
              step={property.minimumInvestment}
              value={investment.amount}
              onChange={handleInvestmentChange}
            />
          </div>
          
          <div className="calculator-row">
            <label>Slots</label>
            <input 
              type="number" 
              name="slots"
              min="1"
              value={investment.slots}
              onChange={handleInvestmentChange}
            />
          </div>
          
          <div className="calculator-row total">
            <span>Total Investment</span>
            <span>{formatCurrency(investment.amount)}</span>
          </div>
          
          <div className="calculator-row returns">
            <span>Expected Returns (Annually)</span>
            <span>{formatCurrency(investment.amount * (property.targetReturn / 100))}</span>
          </div>
          
          <button className="invest-btn" onClick={handleInvestment}>
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;