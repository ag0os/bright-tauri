import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { ConfirmationModal } from './ConfirmationModal';

describe('ConfirmationModal', () => {
  it('renders when isOpen is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={false}
        title="Test Title"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        confirmText="Confirm"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when escape key is pressed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders with custom confirm and cancel text', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        confirmText="Yes, proceed"
        cancelText="No, go back"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, proceed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, go back' })).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { rerender } = renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        variant="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        variant="warning"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        variant="info"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables buttons when isProcessing is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isProcessing={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
  });

  it('renders ReactNode message correctly', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message={
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        }
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });
});
