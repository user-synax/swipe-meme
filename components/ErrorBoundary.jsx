'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-destructive" size={40} />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-8 max-w-xs">
            We hit an unexpected error. Try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-6"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
