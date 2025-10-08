import React from 'react';
import { FileText, Users, Star, TrendingUp, Plus, Zap } from 'lucide-react';
import { MinimalTopBar } from '../../organisms/navigation/Navigation';
import './stats-grid.css';

// Stats Grid Dashboard - Analytics-focused layout
export const StatsGridDashboard: React.FC = () => {
  return (
    <>
      <MinimalTopBar />
      <div className="dashboard-1__container">
        <main className="dashboard-1__main">
          <div className="dashboard-1__header">
            <h1 className="dashboard-1__title">Dashboard</h1>
            <p className="dashboard-1__subtitle">Welcome back! Here's your writing overview.</p>
          </div>

          <div className="dashboard-1__stats">
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Total Words</div>
                <div className="dashboard-1__stat-value">47,328</div>
              </div>
              <div className="dashboard-1__stat-change dashboard-1__stat-change--positive">
                <TrendingUp size={16} />
                <span>+2,450 this week</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Active Projects</div>
                <div className="dashboard-1__stat-value">3</div>
              </div>
              <div className="dashboard-1__stat-change">
                <span>1 in progress</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Writing Streak</div>
                <div className="dashboard-1__stat-value">12 days</div>
              </div>
              <div className="dashboard-1__stat-change dashboard-1__stat-change--positive">
                <Zap size={16} />
                <span>Keep it up!</span>
              </div>
            </div>
            <div className="dashboard-1__stat-card">
              <div>
                <div className="dashboard-1__stat-label">Characters</div>
                <div className="dashboard-1__stat-value">24</div>
              </div>
              <div className="dashboard-1__stat-change">
                <span>Across all projects</span>
              </div>
            </div>
          </div>

          <div className="dashboard-1__content">
            <div className="dashboard-1__primary">
              <div className="dashboard-1__section">
                <div className="dashboard-1__section-header">
                  <h2 className="dashboard-1__section-title">Recent Documents</h2>
                  <a href="#" className="dashboard-1__section-action">View all</a>
                </div>
                <div className="dashboard-1__document-list">
                  {[
                    { title: 'Chapter 3: The Awakening', meta: 'My Novel · Edited 2h ago', status: 'Draft', icon: <FileText size={20} /> },
                    { title: 'Character Profile: Sarah Chen', meta: 'My Novel · Edited 5h ago', status: 'Complete', icon: <Users size={20} /> },
                    { title: 'Outline: Part Two', meta: 'My Novel · Edited yesterday', status: 'Draft', icon: <FileText size={20} /> },
                    { title: 'Chapter 2: First Contact', meta: 'My Novel · Edited 2 days ago', status: 'Final', icon: <FileText size={20} /> },
                  ].map((doc, i) => (
                    <div key={i} className="dashboard-1__document-item">
                      <div className="dashboard-1__document-icon">{doc.icon}</div>
                      <div className="dashboard-1__document-info">
                        <div className="dashboard-1__document-title">{doc.title}</div>
                        <div className="dashboard-1__document-meta">{doc.meta}</div>
                      </div>
                      <div className="dashboard-1__document-status">{doc.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-1__section">
                <div className="dashboard-1__section-header">
                  <h2 className="dashboard-1__section-title">Universe Elements</h2>
                  <a href="#" className="dashboard-1__section-action">Manage</a>
                </div>
                <div className="dashboard-1__document-list">
                  {[
                    { title: 'Downtown District', meta: '8 locations', icon: <Star size={20} /> },
                    { title: 'Tech Corporation HQ', meta: '3 locations', icon: <Star size={20} /> },
                  ].map((doc, i) => (
                    <div key={i} className="dashboard-1__document-item">
                      <div className="dashboard-1__document-icon">{doc.icon}</div>
                      <div className="dashboard-1__document-info">
                        <div className="dashboard-1__document-title">{doc.title}</div>
                        <div className="dashboard-1__document-meta">{doc.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-1__sidebar">
              <div className="dashboard-1__section">
                <h3 className="dashboard-1__section-title">Quick Actions</h3>
                <div className="dashboard-1__quick-actions">
                  <button className="dashboard-1__action-button">
                    <Plus className="dashboard-1__action-icon" />
                    New Document
                  </button>
                  <button className="dashboard-1__action-button dashboard-1__action-button--secondary">
                    <Users className="dashboard-1__action-icon" />
                    New Character
                  </button>
                  <button className="dashboard-1__action-button dashboard-1__action-button--secondary">
                    <Star className="dashboard-1__action-icon" />
                    New Location
                  </button>
                </div>
              </div>

              <div className="dashboard-1__section">
                <h3 className="dashboard-1__section-title">Writing Goal</h3>
                <div className="dashboard-1__stat-value" style={{ marginBottom: '8px' }}>2,450</div>
                <div className="dashboard-1__document-meta" style={{ marginBottom: '16px' }}>words this week</div>
                <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '82%', background: 'var(--color-primary)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  82% of 3,000 word goal
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
