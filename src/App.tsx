import { useNavigationStore } from "@/stores/useNavigationStore";
import { UniverseSelection } from "./views/UniverseSelection";
import { StoriesList } from "./views/StoriesList";
import { UniverseList } from "./views/UniverseList";
import { StoryEditor } from "./views/StoryEditor";
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

    case 'element-detail':
      // TODO: Implement Element Detail view
      return (
        <div style={{ padding: '24px' }}>
          <h1>Element Detail</h1>
          <p>Element ID: {currentRoute.elementId}</p>
          <p>(To be implemented)</p>
        </div>
      );

    default:
      return <UniverseSelection />;
  }
}

export default App;
