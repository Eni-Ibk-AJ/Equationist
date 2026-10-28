import SectionLabel from '../components/SectionLabel.jsx';
import '../styles/auth.css';

export default function AuthPage({ kind, onSubmit, onSwitch, onBack, error, busy }) {
  const signup = kind === 'signup';
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    onSubmit(signup ? 'signup' : 'login', values);
  }
  return (
    <section className="auth-page page-enter">
      <div className="auth-card">
        <button type="button" className="auth-back" onClick={onBack}>← Back to Equationist</button>
        <SectionLabel>YOUR MATH ADVENTURE</SectionLabel>
        <h1>{signup ? 'Make room for little wins.' : 'Welcome back.'}</h1>
        <p className="auth-lead">{signup ? 'Create an account to save your progress and play.' : 'Sign in to pick up where your curiosity left off.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {signup && <label>Your name<input name="display_name" autoComplete="name" required maxLength="100" /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254" /></label>
          <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength="8" maxLength="72" required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-dark auth-submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'} <span>→</span></button>
        </form>
        <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Equationist?'} <button type="button" onClick={onSwitch}>{signup ? 'Log in' : 'Sign up'}</button></p>
        <div className="auth-privacy">🔒 Your progress stays with your account.</div>
      </div>
      <aside className="auth-art"><div className="auth-art-orbit" /><small>TODAY’S LITTLE WIN</small><div className="auth-art-sum">8 <i>×</i> 4</div><strong>32</strong><span>you’re finding your way ✦</span></aside>
    </section>
  );
}
