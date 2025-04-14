import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    axios.get('/api/messages', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setMessages(res.data));
  }, [token]);

  return (
    <div>
      <h2>Messages</h2>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content} - To: {msg.receiver}</div>
      ))}
    </div>
  );
};

export default Messages;