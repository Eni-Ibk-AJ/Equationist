import "./App.css";
import "./styles/global.css";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import { useEquationist } from "./hooks/useEquationist.js";

const levels = [
  { id: "easy", title: "Warm up" },
  { id: "medium", title: "Brain boost" },
  { id: "hard", title: "Big thinker" },
];
const modes = {
  practice: "Solve & learn",
  build: "Equation builder",
  timed: "Beat the clock",
};

export default function App() {
  const app = useEquationist();
  const levelInfo = levels.find((item) => item.id === app.level) || levels[0];
  const login = () => {
    app.setAuthError("");
    app.setScreen("login");
  };
  const signup = () => {
    app.setAuthError("");
    app.setScreen("signup");
  };
  const dashboard = async () => {
    app.setScreen("dashboard");
    try {
      await app.refreshDashboard();
    } catch (error) {
      app.setError(error.message);
    }
  };

  return (
    <div className="app-shell modular-app">
      <SiteHeader
        user={app.user}
        onHome={app.leaveGame}
        onDashboard={dashboard}
        onLogin={login}
        onSignup={signup}
        onLogout={app.logout}
      />
      {app.error && (
        <div className="app-alert" role="alert">
          <span>{app.error}</span>
          <button type="button" onClick={() => app.setError("")}>
            Dismiss
          </button>
        </div>
      )}
      <main
        className={`main-content ${["login", "signup", "dashboard", "admin"].includes(app.screen) ? "main-wide" : ""}`}
      >
        {app.screen === "home" && (
          <HomePage
            user={app.user}
            mode={app.mode}
            onModeChange={app.setMode}
            counts={app.counts}
            challengeCount={app.challengeCount}
            busy={app.busy}
            error={app.error}
            onStart={app.startRound}
            onSignup={signup}
          />
        )}
        {(app.screen === "login" || app.screen === "signup") && (
          <AuthPage
            kind={app.screen}
            onSubmit={app.authenticate}
            onSwitch={() => {
              app.setAuthError("");
              app.setScreen(app.screen === "signup" ? "login" : "signup");
            }}
            onBack={() => app.setScreen("home")}
            error={app.authError}
            busy={app.busy}
          />
        )}
        {app.screen === "dashboard" && app.user && (
          <DashboardPage
            user={app.user}
            data={app.dashboard}
            loading={!app.dashboard && !app.error}
            onPlay={() => app.setScreen("home")}
            onAdmin={() => app.setScreen("admin")}
          />
        )}
        {app.screen === "game" && app.question && (
          <GamePage
            mode={app.mode}
            level={app.level}
            levelInfo={levelInfo}
            question={app.question}
            index={app.index}
            deckLength={app.deck.length}
            seconds={app.seconds}
            score={app.score}
            streak={app.streak}
            bestStreak={app.bestStreak}
            answer={app.answer}
            setAnswer={app.setAnswer}
            feedback={app.feedback}
            checking={app.checking}
            hintOpen={app.hintOpen}
            setHintOpen={app.setHintOpen}
            error={app.error}
            onSubmit={app.submitAnswer}
            onBack={app.leaveGame}
          />
        )}
        {app.screen === "results" && (
          <ResultsPage
            result={app.roundResult}
            levelInfo={levelInfo}
            modeName={modes[app.mode]}
            onAgain={() => app.startRound(app.level)}
            onDashboard={dashboard}
          />
        )}
        {app.screen === "admin" && app.user?.role === "admin" && (
          <AdminPage currentUser={app.user} onBack={dashboard} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
