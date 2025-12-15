import { useNavigationStore } from "@/stores/useNavigationStore";
import { useToastStore } from "@/stores/useToastStore";
import { UniverseSelection } from "./views/UniverseSelection";
import { StoriesList } from "./views/StoriesList";
import { UniverseList } from "./views/UniverseList";
import { StoryEditor } from "./views/StoryEditor";
import { StoryChildren } from "./views/StoryChildren";
import { StoryHistory } from "./views/StoryHistory";
import { StoryVariations } from "./views/StoryVariations";
import { StoryDiff } from "./views/StoryDiff";
import { StoryCombine } from "./views/StoryCombine";
import { ElementDetailPage } from "./views/ElementDetailPage";
import { Settings } from "./views/Settings";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import "./App.css";

function AppContent() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);

  // Render current screen based on route
  switch (currentRoute.screen) {
    case 'universe-selection':
      return (
        <ErrorBoundary name="Universe Selection">
          <UniverseSelection />
        </ErrorBoundary>
      );

    case 'stories-list':
      return (
        <ErrorBoundary name="Stories List">
          <StoriesList />
        </ErrorBoundary>
      );

    case 'universe-list':
      return (
        <ErrorBoundary name="Universe Elements">
          <UniverseList />
        </ErrorBoundary>
      );

    case 'story-editor':
      return (
        <ErrorBoundary name="Story Editor">
          <StoryEditor />
        </ErrorBoundary>
      );

    case 'story-children':
      return (
        <ErrorBoundary name="Story Chapters">
          <StoryChildren parentStoryId={currentRoute.parentStoryId} />
        </ErrorBoundary>
      );

    case 'story-history':
      return (
        <ErrorBoundary name="Story History">
          <StoryHistory />
        </ErrorBoundary>
      );

    case 'story-variations':
      return (
        <ErrorBoundary name="Story Variations">
          <StoryVariations />
        </ErrorBoundary>
      );

    case 'story-compare':
      return (
        <ErrorBoundary name="Story Diff">
          <StoryDiff />
        </ErrorBoundary>
      );

    case 'story-combine':
      return (
        <ErrorBoundary name="Story Combine">
          <StoryCombine />
        </ErrorBoundary>
      );

    case 'element-detail':
      return (
        <ErrorBoundary name="Element Detail">
          <ElementDetailPage />
        </ErrorBoundary>
      );

    case 'settings':
      return (
        <ErrorBoundary name="Settings">
          <Settings />
        </ErrorBoundary>
      );

    default:
      return (
        <ErrorBoundary name="Universe Selection">
          <UniverseSelection />
        </ErrorBoundary>
      );
  }
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
