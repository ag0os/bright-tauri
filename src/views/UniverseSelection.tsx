import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { UniverseCard } from '../components/UniverseCard';
import { CreateUniverseModal } from '../components/CreateUniverseModal';
import type { Universe } from '../types/Universe';
import type { CreateUniverseInput } from '../types/CreateUniverseInput';
import './UniverseSelection.css';

export const UniverseSelection: React.FC = () => {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load universes on mount
  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = async () => {
    try {
      setIsLoading(true);
      const result = await invoke<Universe[]>('list_universes');
      setUniverses(result);
    } catch (error) {
      console.error('Failed to load universes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUniverse = (universe: Universe) => {
    console.log('Selected universe:', universe);
    // TODO: Navigate to universe workspace
    // navigate(`/universe/${universe.id}`);
  };

  const handleCreateUniverse = async (name: string) => {
    try {
      const input: CreateUniverseInput = {
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

      const newUniverse = await invoke<Universe>('create_universe', { input });

      setUniverses([...universes, newUniverse]);
      setIsModalOpen(false);

      // Optionally select the newly created universe
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
      <div className="universe-selection bg-purple-gradient">
        <div className="universe-selection__loading">
          <p>Loading universes...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (universes.length === 0) {
    return (
      <div className="universe-selection bg-purple-gradient">
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
    <div className="universe-selection bg-purple-gradient">
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
