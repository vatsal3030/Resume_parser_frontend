"use client";
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 max-w-lg w-full text-center space-y-6">
            <div className="mx-auto bg-red-100 w-16 h-16 flex items-center justify-center border-4 border-brutal-black rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-black uppercase">Something went wrong</h2>
            
            <p className="text-gray-600 font-medium">
              We&apos;ve encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <div className="bg-gray-100 p-4 border-2 border-brutal-black text-left text-sm font-mono overflow-auto max-h-32">
              {this.state.error?.message || "Unknown error"}
            </div>

            <Button 
              variant="brutal" 
              className="w-full bg-brutal-yellow flex items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
