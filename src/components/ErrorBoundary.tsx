import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  /** Optional fallback UI — if omitted the default arcade-themed card is shown */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#fbf8ff]">
        <div className="max-w-md w-full text-center">
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(239,68,68,0.08), transparent 65%), radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.10), transparent 70%)',
            }}
          />

          {/* Icon */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center mb-8">
            <span className="text-4xl">⚡</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: '#1a0b3d' }}>
            Something went <span className="text-red-500">wrong</span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'rgba(61, 35, 112, 0.78)' }}>
            An unexpected error occurred. Don't worry — your data is safe.
          </p>

          {/* Error details (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-left text-[11px] font-mono text-red-600 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="btn-primary !rounded-xl !text-[13px]"
            >
              Try Again
            </button>
            <a
              href="/"
              className="btn-outline !rounded-xl !text-[13px]"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
