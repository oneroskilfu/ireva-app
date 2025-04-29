import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import MinimalMuiPage from './pages/minimal-mui';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/minimal-mui" component={MinimalMuiPage} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;