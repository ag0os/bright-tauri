import type { ComponentType } from 'react';
import type { Route } from '@/shared/stores/useNavigationStore';
import { UniverseSelection } from '@/features/universe/views/UniverseSelection';
import { StoriesList } from '@/features/stories/views/StoriesList';
import { UniverseList } from '@/features/universe/views/UniverseList';
import { StoryEditor } from '@/features/stories/views/StoryEditor';
import { StoryHistory } from '@/features/stories/views/StoryHistory';
import { StoryVersions } from '@/features/stories/views/StoryVersions';
import { StoryCompare } from '@/features/stories/views/StoryCompare';
import { StorySettings } from '@/features/stories/views/StorySettings';
import { ElementDetailPage } from '@/features/elements/views/ElementDetailPage';
import { ContainerView } from '@/features/containers/views/ContainerView';
import { ContainerSettings } from '@/features/containers/views/ContainerSettings';
import { Settings } from '@/features/settings/views/Settings';

interface RouteEntry {
  component: ComponentType<Record<string, unknown>>;
  errorBoundaryName: string;
  getProps?: (route: Route) => Record<string, unknown>;
}

export const routeRegistry: Record<Route['screen'], RouteEntry> = {
  'universe-selection': {
    component: UniverseSelection,
    errorBoundaryName: 'Universe Selection',
  },
  'stories-list': {
    component: StoriesList,
    errorBoundaryName: 'Stories List',
  },
  'universe-list': {
    component: UniverseList,
    errorBoundaryName: 'Universe Elements',
  },
  'story-editor': {
    component: StoryEditor,
    errorBoundaryName: 'Story Editor',
  },
  'story-history': {
    component: StoryHistory,
    errorBoundaryName: 'Story History',
  },
  'story-versions': {
    component: StoryVersions,
    errorBoundaryName: 'Story Versions',
  },
  'story-compare': {
    component: StoryCompare,
    errorBoundaryName: 'Story Compare',
  },
  'story-settings': {
    component: StorySettings,
    errorBoundaryName: 'Story Settings',
  },
  'element-detail': {
    component: ElementDetailPage,
    errorBoundaryName: 'Element Detail',
  },
  'container-view': {
    component: ContainerView as unknown as ComponentType<Record<string, unknown>>,
    errorBoundaryName: 'Container View',
    getProps: (route) =>
      route.screen === 'container-view' ? { containerId: route.containerId } : {},
  },
  'container-settings': {
    component: ContainerSettings,
    errorBoundaryName: 'Container Settings',
  },
  settings: {
    component: Settings,
    errorBoundaryName: 'Settings',
  },
};

export const defaultScreen: Route['screen'] = 'universe-selection';
