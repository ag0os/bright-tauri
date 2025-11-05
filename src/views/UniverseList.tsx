/**
 * UniverseList View
 *
 * Displays all elements in the current universe.
 * This is a placeholder component that will be implemented in future tasks.
 */

import { PageLayout } from '@/components/layout/PageLayout';
import { useNavigationStore } from '@/stores/useNavigationStore';

export function UniverseList() {
  const navigate = useNavigationStore((state) => state.navigate);

  const handleTabChange = (tab: 'stories' | 'universe') => {
    if (tab === 'stories') {
      navigate({ screen: 'stories-list' });
    }
  };

  return (
    <PageLayout activeTab="universe" onTabChange={handleTabChange}>
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h1>Universe Elements</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '16px' }}>
          This view will display all universe elements (characters, locations, etc.).
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
          (To be implemented in future tasks)
        </p>
      </div>
    </PageLayout>
  );
}
