// client/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Robust Error Boundary to catch UI crashes in external widgets.
 * Logs error details and provides a recovery mechanism.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console (or Sentry in the future)
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl text-center">
          {this.props.fallback}
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
