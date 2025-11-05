import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../test/utils';
import './minimal-squared.css';

/**
 * Example test suite for Button component
 *
 * This demonstrates:
 * - Basic rendering tests
 * - User interaction tests
 * - Accessibility tests
 * - Different button variants
 */

// Simple Button component for testing
function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'base',
  disabled = false,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      renderWithProviders(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with correct variant class', () => {
      renderWithProviders(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary');
    });

    it('renders with correct size class', () => {
      renderWithProviders(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });

    it('applies multiple classes correctly', () => {
      renderWithProviders(
        <Button variant="outline" size="sm">Small Outline</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-outline', 'btn-sm');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(<Button onClick={handleClick}>Click Me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('can be focused with keyboard', async () => {
      const user = userEvent.setup();

      renderWithProviders(<Button>Focus Me</Button>);
      const button = screen.getByRole('button');

      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(<Button onClick={handleClick}>Press Enter</Button>);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('indicates disabled state to screen readers', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('supports aria-label for better accessibility', () => {
      renderWithProviders(
        <Button aria-label="Close dialog">×</Button>
      );
      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders all variants correctly', () => {
      const { rerender } = renderWithProviders(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-primary');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-outline');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-ghost');
    });
  });
});
