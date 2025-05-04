import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import MinimalMuiPage from './pages/minimal-mui';
import UserManagement from './pages/admin/UserManagement';
import PortfolioPage from './pages/admin/PortfolioPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/minimal-mui" component={MinimalMuiPage} />
        <Route path="/admin/users" component={UserManagement} />
        <Route path="/admin/portfolio" component={PortfolioPage} />
        <Route path="/documents" component={DocumentsPage} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;