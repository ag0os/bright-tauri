import { useNavigationStore } from "@/shared/stores/useNavigationStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { routeRegistry, defaultScreen } from "@/shared/navigation/routes";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ToastContainer } from "@/shared/components/Toast";
import "./App.css";

function AppContent() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);

  const entry = routeRegistry[currentRoute.screen] ?? routeRegistry[defaultScreen];
  const Component = entry.component;
  const props = entry.getProps?.(currentRoute) ?? {};

  return (
    <ErrorBoundary name={entry.errorBoundaryName}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

function App() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <ErrorBoundary name="Application">
      <AppContent />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ErrorBoundary>
  );
}

export default App;
