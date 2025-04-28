import React, { Suspense } from 'react';
import { Route, Switch } from 'wouter';

// Minimal test application that only includes isolated Material UI components
function MinimalApp() {
  return (
    <div className="app">
      <Switch>
        {/* Default route */}
        <Route path="/">
          {() => (
            <div style={{ 
              padding: '20px', 
              maxWidth: '800px', 
              margin: '0 auto',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              <h1>Material UI Test Application</h1>
              <p>This is a minimal application to test Material UI components in isolation.</p>
              
              <h2>Test Pages:</h2>
              <ul>
                <li>
                  <a href="/version-mui-test">Version Compatible Material UI Test</a> - 
                  Our most minimal implementation
                </li>
                <li>
                  <a href="/standalone-mui-test.html">Standalone Material UI Test (HTML)</a> - 
                  Completely isolated HTML implementation
                </li>
                <li>
                  <a href="/standalone-mui-app.html">Standalone Material UI App</a> - 
                  Bundled standalone implementation
                </li>
              </ul>
            </div>
          )}
        </Route>
        
        {/* Version Compatible Material UI Test Page */}
        <Route path="/version-mui-test">
          {() => {
            const VersionCompatibleMui = React.lazy(() => import("./pages/VersionCompatibleMui"));
            return (
              <Suspense fallback={<div>Loading...</div>}>
                <VersionCompatibleMui />
              </Suspense>
            );
          }}
        </Route>
      </Switch>
    </div>
  );
}

export default MinimalApp;