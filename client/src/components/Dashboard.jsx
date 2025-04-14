import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Project Dashboard</h2>
      
      {projects.length === 0 ? (
        <p>No projects available at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id || project._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold">{project.title || project.name}</h3>
              <div className="mt-2 text-gray-600">Status: {project.status || 'Active'}</div>
              <div className="mt-2 text-gray-600">Location: {project.location}</div>
              {project.fundingPercentage && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${project.fundingPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm mt-1">{project.fundingPercentage}% Funded</div>
                </div>
              )}
              <button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;