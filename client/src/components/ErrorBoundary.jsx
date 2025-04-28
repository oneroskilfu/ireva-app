import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h1>Something went wrong!</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <div>
              <h2>Error Details:</h2>
              <p>{this.state.error && this.state.error.toString()}</p>
              <div>
                <h3>Component Stack:</h3>
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;