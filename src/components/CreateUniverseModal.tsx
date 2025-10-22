import React, { useState, useEffect, useRef } from 'react';
import './CreateUniverseModal.css';

interface CreateUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const CreateUniverseModal: React.FC<CreateUniverseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setError('Universe name is required');
      return;
    }

    if (name.trim().length < 2) {
      setError('Universe name must be at least 2 characters');
      return;
    }

    // Submit
    onSubmit(name.trim());
    setName('');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Universe</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="universe-name" className="form-label">
              Universe Name
            </label>
            <input
              ref={inputRef}
              id="universe-name"
              type="text"
              className={`form-input ${error ? 'form-input--error' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter universe name"
              aria-invalid={!!error}
              aria-describedby={error ? 'name-error' : undefined}
            />
            {error && (
              <p id="name-error" className="form-error">
                {error}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary btn-base"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-base">
              Create Universe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
