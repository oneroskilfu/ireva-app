import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Simple Home Component
const Home = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>Simplified React App</h1>
      <p>This is a minimal React application without extra providers or hooks.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
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
      
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/about"
          style={{
            color: '#2196F3',
            textDecoration: 'none'
          }}
        >
          Go to About Page
        </a>
      </div>
    </div>
  );
};

// Simple About Component
const About = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>About Page</h1>
      <p>This is a simple about page for the simplified React app.</p>
      
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

// Main App Component
const SimplifiedApp = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
      </Switch>
    </Router>
  );
};

export default SimplifiedApp;