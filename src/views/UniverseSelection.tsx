import React, { useState, useEffect } from 'react';
import { UniverseCard } from '../components/UniverseCard';
import { CreateUniverseModal } from '../components/CreateUniverseModal';
import type { Universe } from '../types/Universe';
import { useUniverseStore } from '@/stores/useUniverseStore';
import { useNavigationStore } from '@/stores/useNavigationStore';
import './UniverseSelection.css';

export const UniverseSelection: React.FC = () => {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { universes, isLoading, loadUniverses, createUniverse, setCurrentUniverse } = useUniverseStore();
  const navigate = useNavigationStore((state) => state.navigate);

  // Load universes on mount
  useEffect(() => {
    loadUniverses();
  }, [loadUniverses]);

  const handleSelectUniverse = (universe: Universe) => {
    console.log('Selected universe:', universe);
    setCurrentUniverse(universe);
    // Navigate to stories list
    navigate({ screen: 'stories-list' });
  };

  const handleCreateUniverse = async (name: string) => {
    try {
      const input = {
        name,
        description: null,
        genre: null,
        tone: null,
        worldbuildingNotes: null,
        themes: null,
        color: null,
        icon: null,
        tags: null,
      };

      const newUniverse = await createUniverse(input);
      setIsModalOpen(false);

      // Select and navigate to the newly created universe
      handleSelectUniverse(newUniverse);
    } catch (error) {
      console.error('Failed to create universe:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  // Calculate total items (universes + "create new" card)
  const totalItems = universes.length + 1;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard if modal is open
      if (isModalOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Move down in grid (assuming 3 columns)
          setFocusedIndex((prev) => {
            const newIndex = prev + 3;
            return newIndex < totalItems ? newIndex : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Move up in grid (assuming 3 columns)
          setFocusedIndex((prev) => {
            const newIndex = prev - 3;
            return newIndex >= 0 ? newIndex : prev;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex === universes.length) {
            // Last item is "Create New"
            handleOpenCreateModal();
          } else {
            // Select the focused universe
            handleSelectUniverse(universes[focusedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, totalItems, universes, isModalOpen]);

  if (isLoading) {
    return (
      <div className="universe-selection">
        <div className="universe-selection__loading">
          <p>Loading universes...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (universes.length === 0) {
    return (
      <div className="universe-selection">
        <div className="universe-selection__empty">
          <h1 className="universe-selection__title">Create your first universe</h1>
          <p className="universe-selection__subtitle">
            Start your creative journey by creating your first universe
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleOpenCreateModal}
            autoFocus
          >
            Create Universe
          </button>
        </div>

        <CreateUniverseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateUniverse}
        />
      </div>
    );
  }

  // Populated state
  return (
    <div className="universe-selection">
      <div className="universe-selection__container">
        <h1 className="universe-selection__header">Select a Universe</h1>

        <div className="universe-grid">
          {universes.map((universe, index) => (
            <UniverseCard
              key={universe.id}
              id={universe.id}
              name={universe.name}
              isFocused={focusedIndex === index}
              onClick={() => handleSelectUniverse(universe)}
            />
          ))}

          <UniverseCard
            name="Create New Universe"
            isCreateNew
            isFocused={focusedIndex === universes.length}
            onClick={handleOpenCreateModal}
          />
        </div>
      </div>

      <CreateUniverseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUniverse}
      />
    </div>
  );
};
