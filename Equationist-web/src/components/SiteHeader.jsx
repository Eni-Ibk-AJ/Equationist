export default function SiteHeader({ user, onHome, onDashboard, onLogin, onSignup, onLogout }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <button type="button" className="brand" onClick={onHome} aria-label="Equationist home">
          <span className="brand-mark"><span>×</span><span>+</span><span>−</span><span>÷</span></span>
          <span className="brand-name">equationist<span className="brand-dot">.</span></span>
        </button>
        <span className="header-center">✳ THE FUN SIDE OF FIGURING THINGS OUT</span>
        <nav className="header-actions" aria-label="Account navigation">
          {user ? <>
            <span className="header-user">Hi, {user.display_name}</span>
            <button type="button" className="header-auth-button" onClick={onDashboard}>My dashboard</button>
            <button type="button" className="header-auth-button header-quiet" onClick={onLogout}>Log out</button>
          </> : <>
            <button type="button" className="header-auth-button header-quiet" onClick={onLogin}>Log in</button>
            <button type="button" className="header-auth-button" onClick={onSignup}>Create account</button>
          </>}
        </nav>
      </div>
    </header>
  );
}
