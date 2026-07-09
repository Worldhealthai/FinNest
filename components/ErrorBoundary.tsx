import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time exceptions in its child tree and shows a recoverable
 * fallback instead of letting the error unwind the whole React tree (which, in
 * a release build, closes/restarts the app). Without a boundary a single bad
 * screen crash takes down the entire app.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface the error to logs (and any future crash-reporting integration).
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            This screen hit an unexpected error. You can try again — the rest of
            the app keeps working.
          </Text>
          {__DEV__ && this.state.error ? (
            <Text style={styles.detail}>{this.state.error.message}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Wraps a component so its render errors are contained. Because the boundary is
 * a parent of the wrapped component, it catches errors thrown in that
 * component's own render body (not just in its children).
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.deepNavy,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.sizes.md,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  detail: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.deepNavy,
  },
});
