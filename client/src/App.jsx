import React from 'react';
import { Route, Switch, Router } from 'wouter';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
}

export default App;