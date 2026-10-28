import SectionLabel from '../components/SectionLabel.jsx';
import '../styles/results.css';

export default function ResultsPage({ result, levelInfo, modeName, onAgain, onDashboard }) {
  if (!result) return null;
  return (
    <section className="results-screen page-enter">
      <div className="results-left"><div className="results-squiggle">✳</div><span className="results-kicker">THAT’S A WRAP! ✦</span><h1>{result.score ? 'Look at you, math genius!' : 'Every try counts.'}</h1><p>{result.mode === 'timed' ? 'A full minute of giving it your best. That deserves a little celebration.' : 'You showed up, gave it a go, and learned along the way. That’s a win.'}</p><div className="results-illustration"><span className="illustration-halo" /><span className="illustration-circle">{result.score ? '★' : '✳'}</span><span className="illustration-confetti c1">✦</span><span className="illustration-confetti c2">+</span></div></div>
      <div className="results-right"><div className="result-header"><SectionLabel>ROUND COMPLETE</SectionLabel><h2>How you did</h2><p>{levelInfo.title} · {modeName}</p></div><div className="result-primary-stat"><span>YOUR SCORE</span><strong>{result.score}<small> correct</small></strong><span className="result-best">Best streak: {result.bestStreak}</span></div><div className="result-stats"><div><span>ACCURACY</span><strong>{result.accuracy}%</strong></div><div><span>BEST STREAK</span><strong>{result.bestStreak}</strong></div><div><span>ATTEMPTED</span><strong>{result.attempts}</strong></div></div><button className="button button-dark result-replay" onClick={onAgain}>Another round <span>→</span></button><button className="result-home" onClick={onDashboard}>See your progress</button></div>
    </section>
  );
}
