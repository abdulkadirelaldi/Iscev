import AppRouter from "./router/index";
import ErrorBoundary from "./components/common/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
