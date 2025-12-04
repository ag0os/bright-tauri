import { useNavigationStore } from "@/stores/useNavigationStore";
import { useToastStore } from "@/stores/useToastStore";
import { UniverseSelection } from "./views/UniverseSelection";
import { StoriesList } from "./views/StoriesList";
import { UniverseList } from "./views/UniverseList";
import { StoryEditor } from "./views/StoryEditor";
import { StoryChildren } from "./views/StoryChildren";
import { StoryHistory } from "./views/StoryHistory";
import { StoryBranches } from "./views/StoryBranches";
import { StoryDiff } from "./views/StoryDiff";
import { StoryMerge } from "./views/StoryMerge";
import { ElementDetailPage } from "./views/ElementDetailPage";
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

    case 'story-branches':
      return (
        <ErrorBoundary name="Story Branches">
          <StoryBranches />
        </ErrorBoundary>
      );

    case 'story-diff':
      return (
        <ErrorBoundary name="Story Diff">
          <StoryDiff />
        </ErrorBoundary>
      );

    case 'story-merge':
      return (
        <ErrorBoundary name="Story Merge">
          <StoryMerge />
        </ErrorBoundary>
      );

    case 'element-detail':
      return (
        <ErrorBoundary name="Element Detail">
          <ElementDetailPage />
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
