/**
 * Filter Options Configuration
 *
 * Type-safe filter options derived from actual TypeScript types.
 * These options are used in dropdown filters across the application.
 *
 * By deriving from the actual types, we ensure:
 * - Invalid options can't be added (compile-time safety)
 * - New valid options are automatically included when types change
 * - Display labels are defined in one place
 *
 * Type Safety Example:
 * ```typescript
 * // This works - value is a valid StoryType
 * const validOption = { value: 'chapter' as StoryType, label: 'Chapter' };
 * STORY_TYPE_OPTIONS.push(validOption); // TypeScript allows this
 *
 * // This fails at compile time - 'invalid' is not a valid StoryType
 * const invalidOption = { value: 'invalid' as StoryType, label: 'Invalid' };
 * // TypeScript error: Type '"invalid"' is not assignable to type 'StoryType'
 * ```
 *
 * How to Update:
 * 1. Types are auto-generated from Rust using ts-rs (see CLAUDE.md)
 * 2. Run: cd src-tauri && cargo test --lib
 * 3. Check src/types/StoryType.ts, StoryStatus.ts, ElementType.ts for changes
 * 4. Update the corresponding options array here to match
 * 5. TypeScript will error if you add an invalid value
 */

import type { StoryType } from '@/types/StoryType';
import type { StoryStatus } from '@/types/StoryStatus';
import type { ElementType } from '@/types/ElementType';

// Story type filter options - derived from StoryType
export const STORY_TYPE_OPTIONS: { value: StoryType; label: string }[] = [
  { value: 'chapter', label: 'Chapter' },
  { value: 'short-story', label: 'Short Story' },
  { value: 'scene', label: 'Scene' },
  { value: 'episode', label: 'Episode' },
  { value: 'poem', label: 'Poem' },
  { value: 'outline', label: 'Outline' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'screenplay', label: 'Screenplay' },
] as const;

// Story status filter options - derived from StoryStatus
export const STORY_STATUS_OPTIONS: { value: StoryStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

// Element type filter options - derived from ElementType
export const ELEMENT_TYPE_OPTIONS: { value: ElementType; label: string }[] = [
  { value: 'character', label: 'Character' },
  { value: 'location', label: 'Location' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'item', label: 'Item' },
  { value: 'organization', label: 'Organization' },
  { value: 'creature', label: 'Creature' },
  { value: 'event', label: 'Event' },
  { value: 'concept', label: 'Concept' },
  { value: 'custom', label: 'Custom' },
] as const;

// Container type filter options
// Note: Container types are stored as strings in the Container model (containerType: string)
// These represent the common organizational container types in the application
export const CONTAINER_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'novel', label: 'Novel' },
  { value: 'series', label: 'Series' },
  { value: 'collection', label: 'Collection' },
] as const;
