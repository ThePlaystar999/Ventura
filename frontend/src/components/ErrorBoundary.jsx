import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Ignore ResizeObserver errors
    if (error?.message?.includes?.('ResizeObserver')) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Ignore ResizeObserver errors
    if (error?.message?.includes?.('ResizeObserver')) {
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#0B4DBB] text-white px-6 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
