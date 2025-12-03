import { useNavigationStore } from "@/stores/useNavigationStore";
import { UniverseSelection } from "./views/UniverseSelection";
import { StoriesList } from "./views/StoriesList";
import { UniverseList } from "./views/UniverseList";
import { StoryEditor } from "./views/StoryEditor";
import { StoryChildren } from "./views/StoryChildren";
import { ElementDetailPage } from "./views/ElementDetailPage";
import "./App.css";

function App() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);

  // Render current screen based on route
  switch (currentRoute.screen) {
    case 'universe-selection':
      return <UniverseSelection />;

    case 'stories-list':
      return <StoriesList />;

    case 'universe-list':
      return <UniverseList />;

    case 'story-editor':
      return <StoryEditor />;

    case 'story-children':
      return <StoryChildren parentStoryId={currentRoute.parentStoryId} />;

    case 'element-detail':
      return <ElementDetailPage />;

    default:
      return <UniverseSelection />;
  }
}

export default App;
