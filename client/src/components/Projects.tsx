import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';

interface Project {
  _id?: string;
  id?: number;
  title?: string;
  name?: string;
  fundingGoal?: number;
  location?: string;
  status?: string;
  fundingPercentage?: number;
  createdAt?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !goal || !location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setCreating(true);
      await axios.post('/api/projects', {
        title,
        fundingGoal: parseFloat(goal),
        location
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setTitle('');
      setGoal('');
      setLocation('');
      setCreating(false);
      
      toast({
        title: 'Project Created',
        description: 'The project has been successfully created',
      });
      
      fetchProjects();
    } catch (err: any) {
      setCreating(false);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create project',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button 
          onClick={() => fetchProjects()}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Project
        </h2>
        <form onSubmit={createProject} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Funding Goal (₦)</label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. 5000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Location</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
                <option value="Ibadan">Ibadan</option>
                <option value="Kano">Kano</option>
              </select>
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={creating}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              {creating ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </span>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">All Projects</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No projects found. Create your first project above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funding Goal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funding
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project._id || project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {project.title || project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {project._id || project.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₦{project.fundingGoal?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'Active' ? 'bg-green-100 text-green-800' :
                        project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.fundingPercentage ? (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${project.fundingPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1">{project.fundingPercentage}%</div>
                        </div>
                      ) : (
                        '0%'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;