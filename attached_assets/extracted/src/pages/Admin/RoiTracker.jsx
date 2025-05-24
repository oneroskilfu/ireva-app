import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const RoiTracker = () => {
  const [roiData, setRoiData] = useState([]);

  useEffect(() => {
    api.get('/roi/summary')
      .then(res => setRoiData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>ROI Summary</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Project</th>
            <th>Amount</th>
            <th>ROI %</th>
            <th>Payout Date</th>
          </tr>
        </thead>
        <tbody>
          {roiData.map((roi, i) => (
            <tr key={i}>
              <td>{roi.userEmail}</td>
              <td>{roi.projectTitle}</td>
              <td>{roi.amount}</td>
              <td>{roi.roiPercentage}%</td>
              <td>{roi.payoutDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoiTracker;
