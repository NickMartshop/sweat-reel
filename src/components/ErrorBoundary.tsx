import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SweatReel error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.href = "/";
  };

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev =
      typeof import.meta !== "undefined" &&
      (import.meta as any).env?.DEV === true;

    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#0A0A12",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>😅</div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            margin: 0,
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#8888AA",
            marginTop: 8,
            maxWidth: 320,
          }}
        >
          SweatReel hit an unexpected error. Your data is safe. Tap below to
          go back to your library.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: 24,
            background: "#4361EE",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "12px 32px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            maxWidth: 280,
          }}
        >
          Back to My Library
        </button>
        <button
          onClick={this.handleReload}
          style={{
            background: "transparent",
            color: "#8888AA",
            border: "1px solid #252535",
            borderRadius: 12,
            padding: "12px 32px",
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            maxWidth: 280,
            marginTop: 12,
          }}
        >
          Reload App
        </button>
        {isDev && this.state.error && (
          <pre
            style={{
              marginTop: 20,
              color: "#EF476F",
              fontSize: 11,
              maxWidth: 320,
              whiteSpace: "pre-wrap",
              textAlign: "left",
            }}
          >
            {this.state.error.toString()}
          </pre>
        )}
      </div>
    );
  }
}
