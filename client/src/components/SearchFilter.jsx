import React, { useState } from 'react';

const SearchFilter = ({ data, onFilter }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [roiMin, setRoiMin] = useState('');
  const [roiMax, setRoiMax] = useState('');

  const handleFilter = () => {
    let filtered = data.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status ? item.status === status : true;
      const matchesRoi =
        (!roiMin || item.roi >= parseFloat(roiMin)) &&
        (!roiMax || item.roi <= parseFloat(roiMax));

      return matchesSearch && matchesStatus && matchesRoi;
    });

    onFilter(filtered);
  };

  // Apply filter on each input change
  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
    
    // Delay filter execution for better performance
    setTimeout(handleFilter, 300);
  };

  return (
    <div className="search-filter">
      <div className="filter-row">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name/location"
            value={search}
            onChange={handleInputChange(setSearch)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            onChange={handleInputChange(setStatus)} 
            value={status}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <div className="filter-group roi-range">
          <input
            type="number"
            placeholder="Min ROI %"
            value={roiMin}
            onChange={handleInputChange(setRoiMin)}
            className="roi-input"
            min="0"
          />
          <span className="roi-separator">-</span>
          <input
            type="number"
            placeholder="Max ROI %"
            value={roiMax}
            onChange={handleInputChange(setRoiMax)}
            className="roi-input"
            min="0"
          />
        </div>
        
        <button 
          onClick={handleFilter}
          className="filter-button"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;