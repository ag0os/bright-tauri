import { invoke } from '@tauri-apps/api/core';
import type { Story, StorySummary, StoryDetail, CreateStoryInput, UpdateStoryInput } from '@/types';

export function listStoriesByUniverse(universeId: string): Promise<StorySummary[]> {
  return invoke<StorySummary[]>('list_stories_by_universe', { universeId });
}

export function createStory(input: CreateStoryInput): Promise<StoryDetail> {
  return invoke<StoryDetail>('create_story', { input });
}

export function getStory(id: string): Promise<StoryDetail> {
  return invoke<StoryDetail>('get_story', { id });
}

export function updateStory(id: string, input: UpdateStoryInput): Promise<Story> {
  return invoke<Story>('update_story', { id, input });
}

/**
 * Delete a story. Rust returns `()` — the frontend should remove
 * the story by the input `id` rather than expecting a returned array.
 */
export function deleteStory(id: string): Promise<void> {
  return invoke('delete_story', { id });
}
