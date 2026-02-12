import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "sonner";

// All styles consolidated in index.css
import "./index.css";

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster 
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            background: '#000000',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          },
          className: 'sonner-toast-custom',
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>
);
