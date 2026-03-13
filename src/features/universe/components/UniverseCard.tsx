import React from 'react';
import './UniverseCard.css';

interface UniverseCardProps {
  id?: string;
  name: string;
  isCreateNew?: boolean;
  isFocused?: boolean;
  onClick: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const UniverseCard: React.FC<UniverseCardProps> = ({
  name,
  isCreateNew = false,
  isFocused = false,
  onClick,
  onKeyDown,
}) => {
  return (
    <div
      className={`universe-card ${isCreateNew ? 'universe-card--create' : ''} ${
        isFocused ? 'universe-card--focused' : ''
      }`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={isCreateNew ? 'Create new universe' : `Select ${name} universe`}
    >
      <div className="universe-card__content">
        {isCreateNew ? (
          <>
            <div className="universe-card__icon">+</div>
            <h3 className="universe-card__title">{name}</h3>
          </>
        ) : (
          <h3 className="universe-card__title">{name}</h3>
        )}
      </div>
    </div>
  );
};
