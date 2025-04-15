import React, { useState } from 'react';

const KYCForm = () => {
  const [form, setForm] = useState({ name: '', bvn: '', doc: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call API to upload form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Full Name" onChange={(e) => setForm({...form, name: e.target.value})} />
      <input type="text" placeholder="BVN/NIN" onChange={(e) => setForm({...form, bvn: e.target.value})} />
      <input type="file" onChange={(e) => setForm({...form, doc: e.target.files[0]})} />
      <button type="submit">Submit KYC</button>
    </form>
  );
};

export default KYCForm;