import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Report error to analytics service (if available)
    this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error Report:', errorReport);

    // Example: Send to error reporting service
    // errorReportingService.captureException(error, { extra: errorReport });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback
        error={this.state.error}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
      />;
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error?: Error;
  onReload: () => void;
  onGoHome: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReload, onGoHome }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center border border-red-700">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-6">
          We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={onReload}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>

        {isDevelopment && error && (
          <details className="text-left bg-gray-900 rounded-lg p-4 border border-gray-700">
            <summary className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-white">
              <Bug className="w-4 h-4" />
              <span>Technical Details (Development Only)</span>
            </summary>
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">Error Message:</h4>
                <code className="text-xs text-gray-300 bg-gray-800 p-2 rounded block">
                  {error.message}
                </code>
              </div>
              {error.stack && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-1">Stack Trace:</h4>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="mt-6 text-xs text-gray-500">
          If this problem persists, please contact support with the error details above.
        </div>
      </div>
    </div>
  );
};

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  const [, setState] = React.useState();

  return React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setState(() => {
      throw error;
    });
  }, []);
};

export default ErrorBoundary;
