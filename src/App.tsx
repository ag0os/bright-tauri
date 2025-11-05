import { useNavigationStore } from "@/stores/useNavigationStore";
import { UniverseSelection } from "./views/UniverseSelection";
import { StoriesList } from "./views/StoriesList";
import { UniverseList } from "./views/UniverseList";
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
      // TODO: Implement Story Editor view
      return (
        <div style={{ padding: '24px' }}>
          <h1>Story Editor</h1>
          <p>Story ID: {currentRoute.storyId}</p>
          <p>(To be implemented)</p>
        </div>
      );

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
