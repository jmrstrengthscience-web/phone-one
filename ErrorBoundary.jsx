import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} sx={{ minHeight: '100vh', backgroundColor: '#071029', color: 'white' }}>
          <Typography variant="h4" mb={2} color="error">
            Something went wrong
          </Typography>
          <Typography variant="h6" mb={2}>
            Error: {this.state.error && this.state.error.toString()}
          </Typography>
          <Typography variant="body2" mb={2}>
            Component Stack:
          </Typography>
          <Typography variant="body2" component="pre" mb={2} sx={{ 
            backgroundColor: '#1a1a1a', 
            padding: 2, 
            borderRadius: 1,
            fontSize: '0.8rem',
            overflow: 'auto'
          }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack ? this.state.errorInfo.componentStack : 'No stack trace available'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;