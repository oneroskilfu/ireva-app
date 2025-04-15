import React from 'react';

const MessagePanel = ({ messages = [] }) => {
  return (
    <div>
      <h4>Inbox</h4>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}><strong>{msg.sender}:</strong> {msg.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default MessagePanel;