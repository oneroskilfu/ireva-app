import React, { useState } from 'react';

const ProjectTable = ({ projects = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // If no projects are provided, show sample projects
  const defaultProjects = [
    {
      id: 1,
      name: 'Lekki Gardens Phase 2',
      location: 'Lekki, Lagos',
      type: 'Residential',
      price: 25000000,
      roi: 15,
      progress: 65,
      status: 'active'
    },
    {
      id: 2,
      name: 'Victoria Island Complex',
      location: 'Victoria Island, Lagos',
      type: 'Commercial',
      price: 45000000,
      roi: 12,
      progress: 78,
      status: 'active'
    },
    {
      id: 3,
      name: 'Abuja Terraces',
      location: 'Jabi, Abuja',
      type: 'Residential',
      price: 18000000,
      roi: 14,
      progress: 32,
      status: 'active'
    },
    {
      id: 4,
      name: 'Golden Heights',
      location: 'Ikeja, Lagos',
      type: 'Mixed Use',
      price: 35000000,
      roi: 13,
      progress: 90,
      status: 'completed'
    },
    {
      id: 5,
      name: 'Oakwood Estate',
      location: 'Port Harcourt',
      type: 'Residential',
      price: 15000000,
      roi: 16,
      progress: 20,
      status: 'active'
    }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  // Handle sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort and filter projects
  const sortedProjects = [...displayProjects]
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch(sortColumn) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'location':
          return direction * a.location.localeCompare(b.location);
        case 'type':
          return direction * a.type.localeCompare(b.type);
        case 'price':
          return direction * (a.price - b.price);
        case 'roi':
          return direction * (a.roi - b.roi);
        case 'progress':
          return direction * (a.progress - b.progress);
        default:
          return 0;
      }
    });

  // Status badge component
  const StatusBadge = ({ status }) => {
    let className = 'status-badge';
    
    switch(status.toLowerCase()) {
      case 'active':
        className += ' active';
        break;
      case 'completed':
        className += ' completed';
        break;
      case 'pending':
        className += ' pending';
        break;
      default:
        break;
    }

    return <span className={className}>{status}</span>;
  };

  // Column sorting indicator
  const SortIndicator = ({ column }) => {
    if (sortColumn !== column) return null;
    
    return (
      <span className="sort-indicator">
        {sortDirection === 'asc' ? ' ↑' : ' ↓'}
      </span>
    );
  };

  return (
    <div className="project-table-container">
      <div className="table-header">
        <h3>Property Projects</h3>
        <div className="table-actions">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-options">
            <select className="filter-select">
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed Use</option>
            </select>
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="project-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Project Name <SortIndicator column="name" />
              </th>
              <th onClick={() => handleSort('location')}>
                Location <SortIndicator column="location" />
              </th>
              <th onClick={() => handleSort('type')}>
                Type <SortIndicator column="type" />
              </th>
              <th onClick={() => handleSort('price')}>
                Price (₦) <SortIndicator column="price" />
              </th>
              <th onClick={() => handleSort('roi')}>
                ROI (%) <SortIndicator column="roi" />
              </th>
              <th onClick={() => handleSort('progress')}>
                Progress <SortIndicator column="progress" />
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map(project => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.location}</td>
                <td>{project.type}</td>
                <td>{project.price.toLocaleString()}</td>
                <td>{project.roi}%</td>
                <td>
                  <div className="progress-bar-small">
                    <div 
                      className="progress" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{project.progress}%</span>
                </td>
                <td>
                  <StatusBadge status={project.status} />
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-btn view">View</button>
                    <button className="action-btn invest">Invest</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedProjects.length === 0 && (
        <div className="no-results">
          <p>No projects match your search criteria.</p>
        </div>
      )}

      <div className="table-pagination">
        <button className="pagination-btn">&lt; Previous</button>
        <div className="pagination-pages">
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
        </div>
        <button className="pagination-btn">Next &gt;</button>
      </div>
    </div>
  );
};

export default ProjectTable;