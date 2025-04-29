import React from 'react';

function PureReact() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <h1 style={{ color: '#4F46E5' }}>Pure React Component</h1>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        This is a simple React component without any theming providers or external styling libraries.
        It uses only inline styles to avoid any potential conflicts.
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          style={{ 
            backgroundColor: '#4F46E5', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Primary Button
        </button>
        <button 
          style={{ 
            backgroundColor: 'white', 
            color: '#4F46E5', 
            border: '1px solid #4F46E5', 
            padding: '10px 20px', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Secondary Button
        </button>
      </div>
    </div>
  );
}

export default PureReact;