// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch projects when component mounts
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects. Please check your authentication.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <div>
        <h3>Projects</h3>
        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Status</th>
                <th>Funding</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id || project.id}>
                  <td>{project.name}</td>
                  <td>{project.shortDescription || project.description}</td>
                  <td>{project.location}</td>
                  <td>{project.status}</td>
                  <td>
                    {project.currentFunding?.toLocaleString?.() || 0} / 
                    {project.totalFunding?.toLocaleString?.() || 0} ₦
                    ({project.fundingPercentage || 0}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;