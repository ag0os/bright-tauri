import { invoke } from '@tauri-apps/api/core';
import type { Story, StorySnapshot } from '@/types';

export function createStorySnapshot(params: {
  storyId: string;
  content: string;
  wordCount?: number;
  maxSnapshots?: number;
}): Promise<StorySnapshot> {
  return invoke<StorySnapshot>('create_story_snapshot', params);
}

export function listStorySnapshots(versionId: string): Promise<StorySnapshot[]> {
  return invoke<StorySnapshot[]>('list_story_snapshots', { versionId });
}

export function updateSnapshotContent(
  storyId: string,
  content: string,
  wordCount: number,
): Promise<void> {
  return invoke('update_snapshot_content', { storyId, content, wordCount });
}

export function switchStorySnapshot(params: {
  storyId: string;
  snapshotId: string;
  wordCount?: number;
  maxSnapshots?: number;
}): Promise<Story> {
  return invoke<Story>('switch_story_snapshot', params);
}

export function cleanupOldSnapshots(versionId: string, keepCount: number): Promise<number> {
  return invoke<number>('cleanup_old_snapshots', { versionId, keepCount });
}
