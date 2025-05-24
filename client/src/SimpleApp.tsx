// Ultra-simple App that bypasses all the complex dependencies
import React from 'react';
import { Route, Switch } from 'wouter';
import StaticHome from './pages/StaticHome';

function SimpleApp() {
  return (
    <Switch>
      <Route path="/" component={StaticHome} />
      <Route path="/signup">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#333'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>Welcome to iREVA!</h1>
            <p>Signup page coming soon...</p>
            <a href="/" style={{ color: '#ff7b00' }}>← Back to Homepage</a>
          </div>
        </div>
      </Route>
      <Route>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#333'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>Page not found</h1>
            <a href="/" style={{ color: '#ff7b00' }}>← Back to Homepage</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default SimpleApp;