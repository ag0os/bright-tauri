/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 * Prevents the entire app from crashing due to errors in individual views.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';

interface Props {
  children: ReactNode;
  /** Fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Name of the component/view for better error messages */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { name } = this.props;
      const { error } = this.state;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            gap: '16px',
            minHeight: '200px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <WarningCircle
            size={48}
            weight="duotone"
            style={{ color: 'var(--color-semantic-error)' }}
          />
          <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>
            Something went wrong
          </h2>
          {name && (
            <p style={{ margin: 0 }}>
              An error occurred in <strong>{name}</strong>
            </p>
          )}
          {error && (
            <code
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: '4px',
                fontSize: '12px',
                maxWidth: '400px',
                overflow: 'auto',
              }}
            >
              {error.message}
            </code>
          )}
          <button
            className="btn btn-primary btn-base"
            onClick={this.handleRetry}
            style={{ marginTop: '8px' }}
          >
            <ArrowClockwise size={16} weight="duotone" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
