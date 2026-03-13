import { invoke } from '@tauri-apps/api/core';
import type { Container, CreateContainerInput, UpdateContainerInput, ContainerChildren } from '@/types';

export function listContainers(universeId: string): Promise<Container[]> {
  return invoke<Container[]>('list_containers', { universeId });
}

export function createContainer(input: CreateContainerInput): Promise<Container> {
  return invoke<Container>('create_container', { input });
}

export function getContainer(id: string): Promise<Container> {
  return invoke<Container>('get_container', { id });
}

export function listContainerChildren(containerId: string): Promise<ContainerChildren> {
  return invoke<ContainerChildren>('list_container_children', { containerId });
}

export function updateContainer(id: string, input: UpdateContainerInput): Promise<Container> {
  return invoke<Container>('update_container', { id, input });
}

export function deleteContainer(id: string): Promise<string[]> {
  return invoke<string[]>('delete_container', { id });
}

/**
 * Reorder children of a container.
 *
 * The frontend tracks containers and stories separately, but the backend
 * accepts a single `child_ids` array and `parent_id`. This function
 * merges both arrays and maps the parameter names accordingly.
 */
export function reorderContainerChildren(
  containerId: string,
  containerIds: string[],
  storyIds: string[],
): Promise<void> {
  return invoke('reorder_container_children', {
    parentId: containerId,
    childIds: [...containerIds, ...storyIds],
  });
}
