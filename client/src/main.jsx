import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App.jsx";
import { store } from "./redux/store.js";
import "./index.css";

const queryClient = new QueryClient();

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error) {
    // Keep detailed error in console for debugging while showing UI fallback.
    // eslint-disable-next-line no-console
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f7f7" }}>
          <div style={{ maxWidth: 760, width: "100%", background: "#fff", border: "1px solid #e7e7e7", borderRadius: 12, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>App runtime error</h2>
            <p style={{ marginBottom: 8 }}>A component crashed while rendering. Use this message to fix the root cause:</p>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#fafafa", border: "1px solid #ececec", borderRadius: 8, padding: 12 }}>
              {this.state.errorMessage}
            </pre>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 12 }}>
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </AppErrorBoundary>
  </React.StrictMode>,
);