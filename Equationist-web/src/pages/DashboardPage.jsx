import SectionLabel from '../components/SectionLabel.jsx';
import '../styles/dashboard.css';

const modeName = (mode) => mode === 'build' ? 'Equation builder' : mode === 'timed' ? 'Beat the clock' : 'Solve & learn';
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

export default function DashboardPage({ user, data, loading, onPlay, onAdmin }) {
  const stats = data?.stats || {};
  const sessions = data?.recent_sessions || [];
  const totalAttempts = Number(stats.total_attempts || 0);
  const accuracy = totalAttempts ? Math.round(Number(stats.total_correct || 0) / totalAttempts * 100) : 0;
  const progress = Math.min(100, accuracy);
  return (
    <div className="dashboard-page page-enter">
      <section className="dashboard-hero">
        <div className="dashboard-welcome-copy"><SectionLabel>YOUR LITTLE SCOREBOARD</SectionLabel><h1>{greeting()}, {user.display_name.split(' ')[0]}<span>!</span></h1><p>You’re showing up, trying things, and making progress. That counts.</p><button type="button" className="button button-dark" onClick={onPlay}>Start a new round <span>→</span></button></div>
        <div className="dashboard-hero-art"><span className="dashboard-orbit" /><div className="dashboard-hero-card"><small>YOUR PERSONAL BEST</small><strong>{stats.personal_best || 0}</strong><span>correct in one round</span><i>✦</i></div><span className="dashboard-flower">✳</span></div>
      </section>

      <section className="dashboard-stat-grid" aria-label="Your progress">
        <article className="dashboard-stat-card stat-rounds"><span className="stat-illustration">↗</span><small>ROUNDS PLAYED</small><strong>{stats.rounds_played || 0}</strong><span className="stat-footnote">Every round is a little win.</span></article>
        <article className="dashboard-stat-card stat-correct"><span className="stat-illustration">✓</span><small>CORRECT ANSWERS</small><strong>{stats.total_correct || 0}</strong><span className="stat-footnote">And plenty of learning in between.</span></article>
        <article className="dashboard-stat-card stat-streak"><span className="stat-illustration">✦</span><small>LONGEST STREAK</small><strong>{stats.longest_streak || 0}</strong><span className="stat-footnote">One answer at a time.</span></article>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel progress-panel"><div className="dashboard-panel-heading"><div><SectionLabel>YOUR PROGRESS</SectionLabel><h2>A little more confident each time.</h2></div><span className="progress-ring-label">{accuracy}%</span></div><div className="progress-summary"><span>Overall answer accuracy</span><strong>{accuracy}%</strong></div><div className="dashboard-progress-track"><span style={{ width: `${progress}%` }} /></div><p>Based on {totalAttempts} {totalAttempts === 1 ? 'answer' : 'answers'} so far. Keep going at your own pace.</p><div className="dashboard-mini-stats"><div><small>QUESTIONS TRIED</small><strong>{totalAttempts}</strong></div><div><small>PERSONAL BEST</small><strong>{stats.personal_best || 0}</strong></div><div><small>ROUNDS SAVED</small><strong>{stats.rounds_played || 0}</strong></div></div></section>
        <aside className="dashboard-nudge"><span className="nudge-spark">✳</span><small>YOUR NEXT LITTLE STEP</small><h2>Five minutes of practice can go a long way.</h2><p>Pick any level. There’s no rush to get it perfect.</p><button type="button" onClick={onPlay}>Choose a challenge <span>↗</span></button></aside>
      </div>

      <section className="dashboard-panel recent-panel"><div className="dashboard-panel-heading"><div><SectionLabel>RECENT ADVENTURES</SectionLabel><h2>Your latest rounds</h2></div><span className="recent-caption">A trail of little wins ✦</span></div>
        {loading ? <div className="dashboard-empty">Gathering your latest adventures…</div> : sessions.length ? <div className="session-list">{sessions.map((session) => <article className="session-row" key={session.id}><span className={`session-level level-${session.difficulty}`}>{session.difficulty}</span><div className="session-title"><strong>{modeName(session.mode)}</strong><small>{new Date(session.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><span className="session-correct">{session.score}<small> / {session.attempts} correct</small></span><span className="session-streak">✦ {session.best_streak}</span></article>)}</div> : <div className="dashboard-empty"><span>✎</span><strong>Your first round is waiting.</strong><p>Choose a challenge and your progress will show up here.</p><button className="button button-dark" onClick={onPlay}>Pick a level →</button></div>}
      </section>
      {user.role === 'admin' && <section className="dashboard-admin-callout"><div><SectionLabel>PLATFORM ADMIN</SectionLabel><h2>Make the next challenge.</h2><p>Manage questions and keep an eye on the Equationist community.</p></div><button type="button" className="button button-dark" onClick={onAdmin}>Open admin tools <span>→</span></button></section>}
    </div>
  );
}
