import { invoke } from '@tauri-apps/api/core';
import type { StoryVersion } from '@/types';

export function listStoryVersions(storyId: string): Promise<StoryVersion[]> {
  return invoke<StoryVersion[]>('list_story_versions', { storyId });
}

export function createStoryVersion(
  storyId: string,
  name: string,
  content: string,
): Promise<StoryVersion> {
  return invoke<StoryVersion>('create_story_version', { storyId, name, content });
}

export function renameStoryVersion(versionId: string, newName: string): Promise<void> {
  return invoke('rename_story_version', { versionId, newName });
}

export function deleteStoryVersion(versionId: string): Promise<void> {
  return invoke('delete_story_version', { versionId });
}

export function switchStoryVersion(storyId: string, versionId: string): Promise<void> {
  return invoke('switch_story_version', { storyId, versionId });
}
