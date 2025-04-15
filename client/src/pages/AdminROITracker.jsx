import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminROITracker() {
  const [roiData, setRoiData] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/roi-summary')
      .then(res => setRoiData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>ROI Tracking</h2>
      <table>
        <thead>
          <tr>
            <th>User</th><th>Project</th><th>Amount</th><th>ROI %</th><th>Payout Date</th>
          </tr>
        </thead>
        <tbody>
          {roiData.map((roi, i) => (
            <tr key={i}>
              <td>{roi.userEmail}</td>
              <td>{roi.projectTitle}</td>
              <td>₦{roi.amount.toLocaleString()}</td>
              <td>{roi.roiPercentage}%</td>
              <td>{new Date(roi.payoutDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}