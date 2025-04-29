import React from 'react';
import { Route, Switch, Router } from 'wouter';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/investor/DashboardPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/investor/dashboard" component={DashboardPage} />
      </Switch>
    </Router>
  );
}

export default App;