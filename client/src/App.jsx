import React from 'react';
import { Switch, Route } from 'wouter';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from "@/hooks/use-theme";
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import TransactionsPage from './pages/TransactionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import { Toaster } from "@/components/ui/toaster";

// App.jsx - Entry point for our simplified routing structure

function SimpleRouter() {
  return (
    <Switch>
      <Route path="/simple" component={HomePage} />
      <Route path="/simple/settings" component={SettingsPage} />
      <Route path="/simple/transactions" component={TransactionsPage} />
      <Route path="/simple/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/simple/terms" component={TermsPage} />
    </Switch>
  );
}

function App() {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <SimpleRouter />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;