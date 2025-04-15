import React from 'react';

const ProjectTable = ({ projects }) => {
  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Project</th>
          <th>Location</th>
          <th>Status</th>
          <th>ROI</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p, idx) => (
          <tr key={idx}>
            <td>{p.name}</td>
            <td>{p.location}</td>
            <td>{p.status}</td>
            <td>{p.roi}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProjectTable;