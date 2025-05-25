import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Component to catch and display errors gracefully
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="md" p="xl">
          <Stack align="center" spacing="xl" py="xl">
            <ThemeIcon size={80} radius={100} color="red.1">
              <IconAlertTriangle size={44} color="var(--mantine-color-red-6)" />
            </ThemeIcon>
            
            <Title order={1} align="center">Something went wrong</Title>
            
            <Text align="center" size="lg" color="dimmed" maw={500}>
              We're sorry, but something unexpected happened. The error has been logged, and we're working on it.
            </Text>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Container size="sm">
                <Text component="pre" size="xs" style={{ 
                  padding: '15px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Text>
              </Container>
            )}
            
            <Group>
              <Button leftIcon={<IconRefresh size={16} />} onClick={this.handleRefresh}>
                Refresh Page
              </Button>
              
              <Button variant="outline" leftIcon={<IconHome size={16} />} onClick={this.handleGoHome}>
                Go to Home
              </Button>
            </Group>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;