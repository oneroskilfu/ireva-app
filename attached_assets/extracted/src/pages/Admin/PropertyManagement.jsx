import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.get('/properties')
      .then(res => setProperties(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Property Management</h2>
      <ul>
        {properties.map(prop => (
          <li key={prop._id}>{prop.title} - {prop.location}</li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyManagement;
