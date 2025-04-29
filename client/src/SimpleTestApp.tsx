import React from 'react';
import { AuthProvider } from './hooks/simplified-auth';

// Simple Home Component without hooks
const SimpleHomePage = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#333' }}>Simple Test App</h1>
      <p>This is a simplified React app with minimal dependencies.</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Counter Example</h2>
        <p>Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '0.5rem'
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
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Main App Component
const SimpleTestApp = () => {
  return (
    <AuthProvider>
      <SimpleHomePage />
    </AuthProvider>
  );
};

export default SimpleTestApp;