import { invoke } from '@tauri-apps/api/core';
import type { Universe, CreateUniverseInput } from '@/types';

export function listUniverses(): Promise<Universe[]> {
  return invoke<Universe[]>('list_universes');
}

export function createUniverse(input: CreateUniverseInput): Promise<Universe> {
  return invoke<Universe>('create_universe', { input });
}

export function getUniverse(id: string): Promise<Universe> {
  return invoke<Universe>('get_universe', { id });
}

export function updateUniverse(id: string, input: Partial<CreateUniverseInput>): Promise<Universe> {
  return invoke<Universe>('update_universe', { id, input });
}

export function deleteUniverse(id: string): Promise<void> {
  return invoke('delete_universe', { id });
}
