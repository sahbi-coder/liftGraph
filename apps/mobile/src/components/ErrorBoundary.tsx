import React, { Component, ErrorInfo, ReactNode } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { colors } from '@/theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to crash reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to crash reporting service (Sentry, Firebase Crashlytics, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // or
    // crashlytics().recordError(error);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <YStack
          flex={1}
          backgroundColor={colors.darkerGray}
          justifyContent="center"
          alignItems="center"
          padding="$4"
          space="$4"
        >
          <Text color={colors.white} fontSize="$6" fontWeight="600" textAlign="center">
            Something went wrong
          </Text>
          <Text color={colors.white} fontSize="$4" textAlign="center" opacity={0.8}>
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </Text>

          {__DEV__ && this.state.error && (
            <YStack
              backgroundColor={colors.midGray}
              padding="$3"
              borderRadius="$3"
              maxWidth="100%"
              maxHeight={200}
            >
              <Text color={colors.white} fontSize="$2" fontFamily="monospace">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text color={colors.white} fontSize="$2" fontFamily="monospace" marginTop="$2">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </YStack>
          )}

          <Button
            backgroundColor={colors.niceOrange}
            color={colors.white}
            onPress={this.handleReset}
            borderRadius="$4"
          >
            <Text color={colors.white} fontWeight="600">
              Try Again
            </Text>
          </Button>
        </YStack>
      );
    }

    return this.props.children;
  }
}
