import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { DeleteStoryModal } from './DeleteStoryModal';
import type { Story } from '@/types/Story';

// Mock story data
const mockStory: Story = {
  id: 'story-1',
  universeId: 'universe-1',
  title: 'Test Story',
  description: 'Test description',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  storyType: 'chapter',
  status: 'inprogress',
  wordCount: 1000,
  targetWordCount: 5000,
  content: 'Test content',
  notes: null,
  outline: null,
  order: null,
  tags: null,
  color: null,
  favorite: null,
  relatedElementIds: null,
  containerId: null,
  seriesName: null,
  lastEditedAt: '2024-01-01T00:00:00Z',
  version: 1,
  variationGroupId: 'group-1',
  variationType: 'original',
  parentVariationId: null,
  gitRepoPath: '/path/to/repo',
  currentBranch: 'main',
  stagedChanges: false,
};

describe('DeleteStoryModal', () => {
  it('renders with story without chapters', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete Story' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText(/Test Story/)).toBeInTheDocument();
    expect(screen.getByText(/This will permanently remove the story and all its version history/)).toBeInTheDocument();
  });

  it('renders with story with chapters and shows warning', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={3}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/3 chapters/)).toBeInTheDocument();
    expect(screen.getByText(/ALL version history/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it('shows singular chapter text when childCount is 1', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={1}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText(/1 chapter/)).toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete Story' });
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when story is null', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={null}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={false}
        story={mockStory}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows processing state when isDeleting is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <DeleteStoryModal
        isOpen={true}
        story={mockStory}
        childCount={0}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isDeleting={true}
      />
    );

    const processingButton = screen.getByRole('button', { name: 'Processing...' });
    expect(processingButton).toBeInTheDocument();
    expect(processingButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
