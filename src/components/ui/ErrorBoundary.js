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
          <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-5">
            <div className="mx-auto bg-red-500/10 border border-red-500/20 w-12 h-12 flex items-center justify-center rounded-2xl text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h2 className="text-xl font-serif font-medium text-(--ink)">Something went wrong</h2>
              <p className="text-xs text-(--muted) mt-1 leading-relaxed">
                An unexpected error occurred. Please try refreshing the view.
              </p>
            </div>
            
            <div className="bg-(--surface-soft) p-3.5 rounded-xl border border-(--hairline-soft) text-left text-xs font-mono text-(--muted) overflow-auto max-h-28">
              {this.state.error?.message || "Unknown error"}
            </div>

            <Button 
              variant="default" 
              className="w-full text-xs py-2.5 flex items-center justify-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh View
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
