import { FileText, Lightning, Plus, Star, TrendUp, Users } from '@phosphor-icons/react';
import type React from 'react';
import { MinimalTopBar } from '../../organisms/navigation/Navigation';
import './stats-grid.css';

const documents = [
  {
    title: 'The Last Light',
    meta: 'Chapter · Novel one',
    status: 'In progress',
    tone: 'accent',
    icon: <FileText size={20} />,
  },
  {
    title: 'Sarah Vale',
    meta: 'Character · updated 5h ago',
    status: 'Complete',
    tone: 'success',
    icon: <Users size={20} />,
  },
  {
    title: 'Part Two outline',
    meta: 'Outline · edited yesterday',
    status: 'Draft',
    tone: 'neutral',
    icon: <FileText size={20} />,
  },
  {
    title: 'Ashwood',
    meta: 'Location · linked to 3 scenes',
    status: 'Linked',
    tone: 'success',
    icon: <Star size={20} />,
  },
] as const;

const universeItems = [
  {
    title: 'The Ash Cycle',
    meta: '3 active books · 24 tracked elements',
    icon: <Star size={20} />,
  },
  {
    title: 'Supporting cast',
    meta: '12 characters · 6 relationship threads',
    icon: <Users size={20} />,
  },
] as const;

// Stats Grid Dashboard - writing overview layout
export const StatsGridDashboard: React.FC = () => {
  return (
    <>
      <MinimalTopBar />
      <div className="dashboard-1 dashboard-1__container option-1 typo-1">
        <main className="dashboard-1__main">
          <div className="dashboard-1__header">
            <h1 className="dashboard-1__title">Writing desk</h1>
            <p className="dashboard-1__subtitle">
              A warm overview of current drafts, progress, and worldbuilding work.
            </p>
          </div>

          <div className="dashboard-1__stats">
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Total words</div>
                <div className="dashboard-1__stat-value">47,328</div>
              </div>
              <div className="dashboard-1__stat-change dashboard-1__stat-change--positive">
                <TrendUp size={16} />
                <span>+2,450 this week</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Active stories</div>
                <div className="dashboard-1__stat-value">3</div>
              </div>
              <div className="dashboard-1__stat-change">
                <span>1 outline in progress</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Writing streak</div>
                <div className="dashboard-1__stat-value">12 days</div>
              </div>
              <div className="dashboard-1__stat-change dashboard-1__stat-change--positive">
                <Lightning size={16} />
                <span>Keep the rhythm</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Universe entries</div>
                <div className="dashboard-1__stat-value">24</div>
              </div>
              <div className="dashboard-1__stat-change">
                <span>Across characters, places, and notes</span>
              </div>
            </div>
          </div>

          <div className="dashboard-1__content">
            <div className="dashboard-1__primary">
              <div className="dashboard-1__section">
                <div className="dashboard-1__section-header">
                  <h2 className="dashboard-1__section-title">Recent documents</h2>
                  <button type="button" className="dashboard-1__section-action">
                    View all
                  </button>
                </div>
                <div className="dashboard-1__document-list">
                  {documents.map((doc) => (
                    <div key={doc.title} className="dashboard-1__document-item">
                      <div className="dashboard-1__document-icon">{doc.icon}</div>
                      <div className="dashboard-1__document-info">
                        <div className="dashboard-1__document-title">{doc.title}</div>
                        <div className="dashboard-1__document-meta">{doc.meta}</div>
                      </div>
                      <div
                        className={`dashboard-1__document-status dashboard-1__document-status--${doc.tone}`}
                      >
                        {doc.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-1__section">
                <div className="dashboard-1__section-header">
                  <h2 className="dashboard-1__section-title">Universe overview</h2>
                  <button type="button" className="dashboard-1__section-action">
                    Manage
                  </button>
                </div>
                <div className="dashboard-1__document-list">
                  {universeItems.map((item) => (
                    <div key={item.title} className="dashboard-1__document-item">
                      <div className="dashboard-1__document-icon dashboard-1__document-icon--neutral">
                        {item.icon}
                      </div>
                      <div className="dashboard-1__document-info">
                        <div className="dashboard-1__document-title">{item.title}</div>
                        <div className="dashboard-1__document-meta">{item.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-1__sidebar">
              <div className="dashboard-1__section">
                <h3 className="dashboard-1__section-title">Quick actions</h3>
                <div className="dashboard-1__quick-actions">
                  <button type="button" className="dashboard-1__action-button">
                    <Plus className="dashboard-1__action-icon" />
                    New story
                  </button>
                  <button
                    type="button"
                    className="dashboard-1__action-button dashboard-1__action-button--secondary"
                  >
                    <Users className="dashboard-1__action-icon" />
                    New character
                  </button>
                  <button
                    type="button"
                    className="dashboard-1__action-button dashboard-1__action-button--secondary"
                  >
                    <Star className="dashboard-1__action-icon" />
                    New location
                  </button>
                </div>
              </div>

              <div className="dashboard-1__section">
                <h3 className="dashboard-1__section-title">Writing goal</h3>
                <div className="dashboard-1__stat-value" style={{ marginBottom: '8px' }}>
                  2,450
                </div>
                <div className="dashboard-1__document-meta" style={{ marginBottom: '16px' }}>
                  words this week
                </div>
                <div className="dashboard-1__progress-track">
                  <div className="dashboard-1__progress-fill"></div>
                </div>
                <div className="dashboard-1__goal-note">82% of a 3,000 word goal</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
