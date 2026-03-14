import { Component, type ErrorInfo, type ReactNode } from 'react'
import { GlassPanel } from './GlassPanel'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <GlassPanel intensity="medium" className="max-w-md p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-white/60 mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors"
            >
              Reload
            </button>
          </GlassPanel>
        </div>
      )
    }

    return this.props.children
  }
}
