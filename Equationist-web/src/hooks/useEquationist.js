import { useCallback, useEffect, useRef, useState } from 'react';
import { api, clearToken, getToken, saveToken } from '../api.js';

export function useEquationist() {
  const [screen, setScreen] = useState(() => getToken() ? 'dashboard' : 'home');
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({});
  const [mode, setMode] = useState('practice');
  const [dashboard, setDashboard] = useState(null);
  const [authError, setAuthError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState('easy');
  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(60);
  const [answer, setAnswer] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const startedAt = useRef(0);
  const deadline = useRef(0);
  const advanceTimer = useRef(null);
  const roundFinished = useRef(true);
  const finishRef = useRef(null);
  const question = deck.length ? deck[index % deck.length] : null;
  const challengeCount = Object.values(counts).reduce((total, value) => total + Number(value || 0), 0);

  useEffect(() => {
    let alive = true;
    api('/questions/counts', { auth: false })
      .then(({ counts: questionCounts }) => alive && setCounts(questionCounts || {}))
      .catch((e) => alive && setError(e.message));
    if (getToken()) {
      api('/auth/me').then(({ user: currentUser }) => {
        if (!alive) return;
        setUser(currentUser);
        return api('/sessions/dashboard')
          .then((data) => alive && setDashboard(data))
          .catch((e) => alive && setError(e.message));
      }).catch(() => {
        clearToken();
        if (alive) { setUser(null); setScreen('home'); }
      });
    }
    return () => { alive = false; window.clearTimeout(advanceTimer.current); };
  }, []);

  const refreshDashboard = useCallback(async () => {
    const data = await api('/sessions/dashboard');
    setDashboard(data);
    return data;
  }, []);

  async function authenticate(kind, credentials) {
    setBusy(true); setAuthError('');
    try {
      const { token, user: currentUser } = await api(`/auth/${kind}`, { method: 'POST', body: credentials, auth: false });
      saveToken(token);
      setUser(currentUser);
      setScreen('dashboard');
      try { await refreshDashboard(); } catch (e) { setError(e.message); }
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    } finally { setBusy(false); }
  }

  function logout() {
    clearToken(); setUser(null); setDashboard(null); setRoundResult(null); setScreen('home');
  }

  async function startRound(nextLevel) {
    setError('');
    if (!user) { setAuthError('Log in or create an account to save your progress and play.'); setScreen('login'); return; }
    setBusy(true);
    try {
      const { questions } = await api(`/questions?difficulty=${nextLevel}&mode=${mode}`, { auth: false });
      if (!questions.length) { setError('There are no active questions for this level yet.'); return; }
      window.clearTimeout(advanceTimer.current);
      roundFinished.current = false;
      setLevel(nextLevel); setDeck(questions); setIndex(0); setSeconds(60);
      setScore(0); setAttempts(0); setStreak(0); setBestStreak(0); setAnswer(''); setFeedback(''); setHintOpen(false);
      startedAt.current = Date.now(); deadline.current = Date.now() + 60_000;
      setScreen('game');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const finishRound = useCallback(async () => {
    if (roundFinished.current) return;
    roundFinished.current = true;
    window.clearTimeout(advanceTimer.current);
    const result = { score, attempts, bestStreak, mode, level, accuracy: attempts ? Math.round(score / attempts * 100) : 0 };
    setRoundResult(result); setScreen('results');
    try {
      await api('/sessions', { method: 'POST', body: {
        mode, difficulty: level, score, attempts, best_streak: bestStreak,
        duration_seconds: Math.max(0, Math.floor((Date.now() - startedAt.current) / 1000)),
      } });
    } catch (e) { setError(`Round finished, but it could not be saved: ${e.message}`); }
  }, [score, attempts, bestStreak, mode, level]);

  useEffect(() => { finishRef.current = finishRound; }, [finishRound]);
  useEffect(() => {
    if (screen !== 'game' || mode !== 'timed') return undefined;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, deadline.current - Date.now());
      setSeconds(Math.ceil(remaining / 1000));
      if (remaining === 0) finishRef.current?.();
    }, 150);
    return () => window.clearInterval(interval);
  }, [screen, mode]);

  async function submitAnswer(event) {
    event?.preventDefault();
    if (!question || !answer.trim() || checking || feedback || roundFinished.current) return;
    setChecking(true); setError('');
    try {
      const { correct } = await api(`/questions/${question.id}/check`, { method: 'POST', body: { answer, mode } });
      setFeedback(correct ? 'correct' : 'incorrect');
      setAttempts((n) => n + 1);
      if (correct) {
        setScore((n) => n + 1);
        setStreak((n) => { const next = n + 1; setBestStreak((old) => Math.max(old, next)); return next; });
      } else setStreak(0);
      advanceTimer.current = window.setTimeout(() => {
        if (mode !== 'timed' && index + 1 >= deck.length) { finishRef.current?.(); return; }
        setIndex((n) => n + 1); setAnswer(''); setFeedback(''); setHintOpen(false);
      }, 950);
    } catch (e) { setError(e.message); }
    finally { setChecking(false); }
  }

  function leaveGame() {
    window.clearTimeout(advanceTimer.current);
    roundFinished.current = true;
    setFeedback(''); setError(''); setScreen('home');
  }

  return {
    screen, setScreen, user, counts, challengeCount, mode, setMode, dashboard,
    refreshDashboard, authenticate, logout, authError, setAuthError, error,
    setError, busy, startRound, level, deck, index, seconds, answer, setAnswer,
    hintOpen, setHintOpen, checking, feedback, score, attempts, streak,
    bestStreak, roundResult, question, submitAnswer, leaveGame,
  };
}
