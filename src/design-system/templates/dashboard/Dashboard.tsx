import React from 'react';
import { FileText, Users, Star, TrendingUp, Plus, Clock, Target, BookOpen, Zap, Calendar } from 'lucide-react';
import { MinimalTopBar } from '../../organisms/navigation/Navigation';
import './option1-stats-grid.css';
import './option2-focus-mode.css';
import './option3-timeline-activity.css';

export interface DashboardProps {
  variant: 'option1' | 'option2' | 'option3';
}

// Option 1: Stats Grid Dashboard
const StatsGridDashboard: React.FC = () => {
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
                    { title: 'Outline: Part Two', meta: 'My Novel · Edited yesterday', status: 'Draft', icon: <BookOpen size={20} /> },
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

// Option 2: Focus Mode Dashboard
const FocusModeDashboard: React.FC = () => {
  return (
    <>
      <MinimalTopBar />
      <div className="dashboard-2__container">
        <main className="dashboard-2__main">
          <div className="dashboard-2__stats-bar">
            <div className="dashboard-2__stat">
              <div className="dashboard-2__stat-icon"><FileText size={18} /></div>
              <div className="dashboard-2__stat-info">
                <div className="dashboard-2__stat-value">47.3k</div>
                <div className="dashboard-2__stat-label">Words</div>
              </div>
            </div>
            <div className="dashboard-2__stat">
              <div className="dashboard-2__stat-icon"><Target size={18} /></div>
              <div className="dashboard-2__stat-info">
                <div className="dashboard-2__stat-value">82%</div>
                <div className="dashboard-2__stat-label">Goal</div>
              </div>
            </div>
            <div className="dashboard-2__stat">
              <div className="dashboard-2__stat-icon"><Zap size={18} /></div>
              <div className="dashboard-2__stat-info">
                <div className="dashboard-2__stat-value">12</div>
                <div className="dashboard-2__stat-label">Day Streak</div>
              </div>
            </div>
            <div className="dashboard-2__stat">
              <div className="dashboard-2__stat-icon"><Clock size={18} /></div>
              <div className="dashboard-2__stat-info">
                <div className="dashboard-2__stat-value">3.2h</div>
                <div className="dashboard-2__stat-label">This Week</div>
              </div>
            </div>
          </div>

          <div className="dashboard-2__content">
            <div>
              <div className="dashboard-2__focus-card">
                <div className="dashboard-2__focus-header">
                  <div className="dashboard-2__focus-label">Continue Writing</div>
                  <h2 className="dashboard-2__focus-title">Chapter 3: The Awakening</h2>
                  <div className="dashboard-2__focus-meta">My Novel • Last edited 2 hours ago</div>
                </div>
                <div className="dashboard-2__focus-progress">
                  <div className="dashboard-2__progress-label">Chapter Progress</div>
                  <div className="dashboard-2__progress-bar">
                    <div className="dashboard-2__progress-fill" style={{ width: '65%' }}></div>
                  </div>
                  <div className="dashboard-2__progress-stats">
                    <span>3,250 words</span>
                    <span>65% complete</span>
                  </div>
                </div>
                <div>
                  <button className="dashboard-2__focus-action">
                    <FileText size={20} />
                    Continue Writing
                  </button>
                </div>
              </div>

              <div className="dashboard-2__recent">
                <h2 className="dashboard-2__section-title">Recent Projects</h2>
                <div className="dashboard-2__project-grid">
                  {[
                    { title: 'My Novel', meta: '47.3k words • 12 chapters' },
                    { title: 'Short Stories', meta: '8.2k words • 3 stories' },
                    { title: 'Research Notes', meta: '15.7k words • 24 notes' },
                  ].map((project, i) => (
                    <div key={i} className="dashboard-2__project-card">
                      <div className="dashboard-2__project-title">{project.title}</div>
                      <div className="dashboard-2__project-meta">{project.meta}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-2__sidebar">
              <div className="dashboard-2__sidebar-card">
                <h3 className="dashboard-2__sidebar-title">Recent Activity</h3>
                <div className="dashboard-2__activity-list">
                  {[
                    { text: 'Updated Chapter 3', time: '2 hours ago', icon: <FileText size={16} /> },
                    { text: 'Created character Sarah Chen', time: '5 hours ago', icon: <Users size={16} /> },
                    { text: 'Added location Downtown District', time: 'Yesterday', icon: <Star size={16} /> },
                  ].map((activity, i) => (
                    <div key={i} className="dashboard-2__activity-item">
                      <div className="dashboard-2__activity-icon">{activity.icon}</div>
                      <div className="dashboard-2__activity-content">
                        <div className="dashboard-2__activity-text">{activity.text}</div>
                        <div className="dashboard-2__activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-2__sidebar-card">
                <h3 className="dashboard-2__sidebar-title">Quick Create</h3>
                <div className="dashboard-2__quick-create">
                  <button className="dashboard-2__create-button">
                    <Plus className="dashboard-2__create-icon" />
                    New Document
                  </button>
                  <button className="dashboard-2__create-button">
                    <Users className="dashboard-2__create-icon" />
                    New Character
                  </button>
                  <button className="dashboard-2__create-button">
                    <Star className="dashboard-2__create-icon" />
                    New Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// Option 3: Timeline Activity Dashboard
const TimelineActivityDashboard: React.FC = () => {
  return (
    <>
      <MinimalTopBar />
      <div className="dashboard-3__container">
        <main className="dashboard-3__main">
          <div className="dashboard-3__header">
            <h1 className="dashboard-3__greeting">Good afternoon, Writer!</h1>
            <p className="dashboard-3__date">Wednesday, October 8, 2025</p>
          </div>

          <div className="dashboard-3__content">
            <div className="dashboard-3__timeline">
              <div className="dashboard-3__timeline-card">
                <h2 className="dashboard-3__timeline-title">Today's Activity</h2>
                <div className="dashboard-3__timeline-list">
                  {[
                    { time: '2:30 PM', content: 'Updated Chapter 3: The Awakening', meta: '450 words added', completed: true },
                    { time: '11:15 AM', content: 'Created character profile for Sarah Chen', meta: 'Added to My Novel', completed: true },
                    { time: '9:00 AM', content: 'Started writing session', meta: '1 hour, 15 minutes', completed: true },
                  ].map((item, i) => (
                    <div key={i} className="dashboard-3__timeline-item">
                      <div className={`dashboard-3__timeline-dot ${item.completed ? 'dashboard-3__timeline-dot--completed' : ''}`}></div>
                      <div className="dashboard-3__timeline-time">{item.time}</div>
                      <div className="dashboard-3__timeline-content">{item.content}</div>
                      <div className="dashboard-3__timeline-meta">{item.meta}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-3__streak-card">
                <div className="dashboard-3__streak-value">12</div>
                <div className="dashboard-3__streak-label">Day Writing Streak 🔥</div>
                <div className="dashboard-3__streak-days">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className={`dashboard-3__streak-day ${i < 5 ? 'dashboard-3__streak-day--active' : ''}`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-3__progress">
              <div className="dashboard-3__goals-card">
                <div className="dashboard-3__card-header">
                  <h2 className="dashboard-3__card-title">Writing Goals</h2>
                  <span className="dashboard-3__card-badge">This Week</span>
                </div>
                <div className="dashboard-3__goals-grid">
                  <div className="dashboard-3__goal-item">
                    <div className="dashboard-3__goal-label">Daily Words</div>
                    <div className="dashboard-3__goal-value">450</div>
                    <div className="dashboard-3__goal-progress">
                      <div className="dashboard-3__goal-progress-fill" style={{ width: '90%' }}></div>
                    </div>
                    <div className="dashboard-3__goal-target">Goal: 500 words/day</div>
                  </div>
                  <div className="dashboard-3__goal-item">
                    <div className="dashboard-3__goal-label">Weekly Total</div>
                    <div className="dashboard-3__goal-value">2,450</div>
                    <div className="dashboard-3__goal-progress">
                      <div className="dashboard-3__goal-progress-fill" style={{ width: '82%' }}></div>
                    </div>
                    <div className="dashboard-3__goal-target">Goal: 3,000 words/week</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-3__projects-card">
                <div className="dashboard-3__card-header">
                  <h2 className="dashboard-3__card-title">Active Projects</h2>
                </div>
                <div className="dashboard-3__projects-list">
                  {[
                    { title: 'My Novel', meta: 'Science Fiction', words: 47328, chapters: 12, progress: 65 },
                    { title: 'Short Stories', meta: 'Collection', words: 8200, chapters: 3, progress: 30 },
                  ].map((project, i) => (
                    <div key={i} className="dashboard-3__project-item">
                      <div className="dashboard-3__project-cover">
                        <BookOpen size={24} />
                      </div>
                      <div className="dashboard-3__project-info">
                        <div className="dashboard-3__project-title">{project.title}</div>
                        <div className="dashboard-3__project-meta">{project.meta}</div>
                        <div className="dashboard-3__project-progress-bar">
                          <div className="dashboard-3__project-progress-fill" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="dashboard-3__project-stats">
                        <div className="dashboard-3__project-stat">
                          <div className="dashboard-3__project-stat-value">{(project.words / 1000).toFixed(1)}k</div>
                          <div className="dashboard-3__project-stat-label">Words</div>
                        </div>
                        <div className="dashboard-3__project-stat">
                          <div className="dashboard-3__project-stat-value">{project.chapters}</div>
                          <div className="dashboard-3__project-stat-label">Chapters</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// Main Dashboard Component
export const Dashboard: React.FC<DashboardProps> = ({ variant }) => {
  if (variant === 'option1') {
    return <StatsGridDashboard />;
  }
  if (variant === 'option2') {
    return <FocusModeDashboard />;
  }
  if (variant === 'option3') {
    return <TimelineActivityDashboard />;
  }
  return null;
};
