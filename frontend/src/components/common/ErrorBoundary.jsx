import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 p-8 text-center font-gilroy">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#FEE2E2" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1B3F84" }}>
              Bir şeyler ters gitti
            </h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Bu bölüm yüklenirken beklenmedik bir hata oluştu. Sayfayı yenileyerek tekrar deneyin.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#1B3F84" }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
