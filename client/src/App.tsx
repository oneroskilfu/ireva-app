import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import MinimalMuiPage from './pages/minimal-mui';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/minimal-mui" component={MinimalMuiPage} />
        <Route path="/admin/users" component={UserManagement} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;