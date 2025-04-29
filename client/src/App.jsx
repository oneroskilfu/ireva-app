import React from 'react';
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage.jsx';
import DashboardPage from './pages/investor/DashboardPage';

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/investor/dashboard" component={DashboardPage} />
    </Switch>
  );
}

export default App;