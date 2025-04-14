import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const PropertyCard = ({ property }) => {
  // Convert target return to percentage display
  const targetReturnPercent = property.targetReturn ? 
    `${parseFloat(property.targetReturn).toFixed(2)}%` : 'N/A';
  
  // Format currency (Naira)
  const formatCurrency = (amount) => {
    return `₦${parseInt(amount).toLocaleString('en-NG')}`;
  };

  // Calculate funding progress percentage
  const progressPercent = Math.min(
    100, 
    Math.round((property.currentFunding / property.totalFunding) * 100)
  );

  return (
    <div className="property-card">
      <div className="property-card-image">
        <img src={property.imageUrl || 'https://via.placeholder.com/300x200'} alt={property.name} />
        <div className="property-type">{property.type}</div>
      </div>
      
      <div className="property-card-content">
        <h3>{property.name}</h3>
        <p className="property-location">{property.location}</p>
        
        <div className="property-stats">
          <div className="stat">
            <span className="stat-label">Target Return</span>
            <span className="stat-value">{targetReturnPercent}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Minimum</span>
            <span className="stat-value">{formatCurrency(property.minimumInvestment)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Term</span>
            <span className="stat-value">{property.term} months</span>
          </div>
        </div>
        
        <div className="funding-progress">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="funding-info">
            <span>{formatCurrency(property.currentFunding)} raised</span>
            <span>{property.daysLeft} days left</span>
          </div>
        </div>
        
        <button className="invest-btn">Invest Now</button>
      </div>
    </div>
  );
};

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    propertyType: '',
    location: '',
    minReturn: '',
    maxReturn: '',
  });

  useEffect(() => {
    // Fetch properties from API
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await API.get('/properties');
        setProperties(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter properties based on user selections
  const filteredProperties = properties.filter(property => {
    if (filters.propertyType && property.type !== filters.propertyType) return false;
    if (filters.location && !property.location.includes(filters.location)) return false;
    if (filters.minReturn && parseFloat(property.targetReturn) < parseFloat(filters.minReturn)) return false;
    if (filters.maxReturn && parseFloat(property.targetReturn) > parseFloat(filters.maxReturn)) return false;
    return true;
  });

  // Get unique locations for the filter dropdown
  const locations = [...new Set(properties.map(p => p.location))];
  
  return (
    <div className="property-list-container">
      <h2>Available Investment Properties</h2>
      
      <div className="filters">
        <div className="filter-group">
          <label>Property Type</label>
          <select 
            name="propertyType" 
            value={filters.propertyType} 
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="mixed-use">Mixed-Use</option>
            <option value="land">Land</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Location</label>
          <select 
            name="location" 
            value={filters.location} 
            onChange={handleFilterChange}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Min Return (%)</label>
          <input 
            type="number" 
            name="minReturn" 
            value={filters.minReturn} 
            onChange={handleFilterChange}
            placeholder="Min %"
          />
        </div>
        
        <div className="filter-group">
          <label>Max Return (%)</label>
          <input 
            type="number" 
            name="maxReturn" 
            value={filters.maxReturn} 
            onChange={handleFilterChange}
            placeholder="Max %"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading properties...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredProperties.length > 0 ? (
        <div className="property-grid">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          No properties match your filters. Try adjusting your criteria.
        </div>
      )}
    </div>
  );
};

export default PropertyList;