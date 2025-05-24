import React from 'react';

// This is a completely standalone component with no external dependencies or context
const BasicStandaloneTest = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Basic Standalone Test Page</h1>
      <p>This is a basic standalone test page with no external dependencies.</p>
      <p>It only uses React's built-in useState hook.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <p>Counter: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '0.5rem'
          }}
        >
          Reset
        </button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/"
          style={{
            color: '#2196F3',
            textDecoration: 'none'
          }}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default BasicStandaloneTest;