import { createRoot } from 'react-dom/client';
import SimpleTestApp from './SimpleTestApp';

// Render the simplified test app without extra providers
createRoot(document.getElementById('root')!).render(<SimpleTestApp />);