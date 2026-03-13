import { invoke } from '@tauri-apps/api/core';
import type { Element, CreateElementInput, UpdateElementInput } from '@/types';

export function listElementsByUniverse(universeId: string): Promise<Element[]> {
  return invoke<Element[]>('list_elements_by_universe', { universeId });
}

export function createElement(input: CreateElementInput): Promise<Element> {
  return invoke<Element>('create_element', { input });
}

export function getElement(id: string): Promise<Element> {
  return invoke<Element>('get_element', { id });
}

export function updateElement(id: string, input: UpdateElementInput): Promise<Element> {
  return invoke<Element>('update_element', { id, input });
}

export function deleteElement(id: string): Promise<void> {
  return invoke('delete_element', { id });
}
