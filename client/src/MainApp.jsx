import BasicApp from './BasicApp';
import SafeThemeProvider from './components/SafeThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';

function MainApp() {
  return (
    <SafeThemeProvider>
      <CssBaseline />
      <BasicApp />
    </SafeThemeProvider>
  );
}

export default MainApp;