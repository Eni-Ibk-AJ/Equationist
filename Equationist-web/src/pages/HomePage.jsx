import SectionLabel from "../components/SectionLabel.jsx";
import "../styles/home.css";

const modes = [
  {
    id: "practice",
    icon: "✎",
    name: "Solve & learn",
    detail: "No rush, just the joy of figuring it out.",
  },
  {
    id: "build",
    icon: "▦",
    name: "Equation builder",
    detail: "Piece together an expression to hit the target.",
  },
  {
    id: "timed",
    icon: "◷",
    name: "Beat the clock",
    detail: "A cheerful 60-second sprint.",
  },
];

const levels = [
  {
    id: "easy",
    number: "01",
    icon: "+",
    name: "Warm up",
    detail: "Start small and find your rhythm.",
    tags: ["Addition", "Multiplication"],
    tone: "mint",
  },
  {
    id: "medium",
    number: "02",
    icon: "÷",
    name: "Brain boost",
    detail: "A little challenge for growing math muscles.",
    tags: ["Brackets", "Order of operations"],
    tone: "peach",
  },
  {
    id: "hard",
    number: "03",
    icon: "x²",
    name: "Big thinker",
    detail: "Stretch your thinking. You can do more than you know.",
    tags: ["Equations", "Variables"],
    tone: "lilac",
  },
];

export default function HomePage({
  user,
  mode,
  onModeChange,
  counts,
  challengeCount,
  busy,
  error,
  onStart,
  onSignup,
}) {
  return (
    <div className="landing-page page-enter">
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-eyebrow">
            <span>✳</span> A HAPPY PLACE TO PRACTISE MATH
          </div>
          <h1>
            Big ideas start with <em>little wins.</em>
          </h1>
          <p>
            Short, playful math challenges that help curious minds build
            confidence one moment at a time.
          </p>
          <div className="landing-actions">
            <a href="#levels" className="landing-primary">
              Choose a challenge <span>↗</span>
            </a>
            {!user && (
              <button
                type="button"
                className="landing-secondary"
                onClick={onSignup}
              >
                Create your free account
              </button>
            )}
          </div>
          <div className="landing-proof">
            <span className="proof-dots">
              <i />
              <i />
              <i />
            </span>
            <span>Made for little wins and big moments</span>
          </div>
        </div>
        <div className="landing-art" aria-label="Example math challenge">
          <div className="landing-art-grid" />
          <span className="landing-orbit orbit-one" />
          <span className="landing-orbit orbit-two" />
          <span className="landing-float float-plus">+</span>
          <span className="landing-float float-star">✦</span>
          <span className="landing-float float-pi">π</span>
          <div className="landing-challenge-card">
            <div className="landing-card-head">
              <span>
                <i />
                <i />
                <i />
              </span>
              <small>YOUR NEXT LITTLE CHALLENGE</small>
            </div>
            <div className="landing-equation">
              8 <b>×</b> 4 <span>=</span> <strong>32</strong>
            </div>
            <div className="landing-card-foot">
              <span>✓</span> YOU’VE GOT THIS
            </div>
          </div>
          <span className="landing-art-note">
            take a breath
            <br />
            and find your way ↗
          </span>
        </div>
      </section>

      <div className="landing-metrics" aria-label="Equationist overview">
        <div>
          <strong>{challengeCount}</strong>
          <span>little challenges</span>
        </div>
        <div>
          <strong>3</strong>
          <span>difficulty levels</span>
        </div>
        <div>
          <strong>3</strong>
          <span>ways to play</span>
        </div>
        <div className="metrics-note">
          A little practice goes
          <br />
          <b>a long way.</b>
        </div>
      </div>

      <section className="landing-section" aria-labelledby="mode-heading">
        <div className="landing-section-head">
          <div>
            <SectionLabel>STEP 01 · PICK A PLAY STYLE</SectionLabel>
            <h2 id="mode-heading">How would you like to play?</h2>
            <p>Choose the kind of challenge that feels right today.</p>
          </div>
          <span className="section-scribble">make it yours ↘</span>
        </div>
        <div className="landing-mode-grid">
          {modes.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onModeChange(item.id)}
              className={`landing-mode-card ${mode === item.id ? "active" : ""}`}
              aria-pressed={mode === item.id}
            >
              <span className="landing-mode-icon">{item.icon}</span>
              <span className="landing-mode-check">
                {mode === item.id ? "✓" : "+"}
              </span>
              <small>
                {item.id === "timed"
                  ? "60-SECOND SPRINT"
                  : item.id === "build"
                    ? "GET CREATIVE"
                    : "NO RUSH"}
              </small>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-section landing-level-section" id="levels">
        <div className="landing-section-head">
          <div>
            <SectionLabel>STEP 02 · CHOOSE YOUR CHALLENGE</SectionLabel>
            <h2>Start wherever you like.</h2>
            <p>Easy does it, or go all in. It’s your call.</p>
          </div>
          <span className="selected-play-style">
            Playing: <b>{modes.find((item) => item.id === mode)?.name}</b>
          </span>
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="landing-level-grid">
          {levels.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`landing-level-card ${item.tone}`}
              onClick={() => onStart(item.id)}
              disabled={busy}
            >
              <div className="landing-level-top">
                <span>LEVEL {item.number}</span>
                <span>{item.number}</span>
              </div>
              <div className="landing-level-art">
                <span>{item.icon}</span>
                <i>✳</i>
              </div>
              <strong className="landing-level-title">{item.name}</strong>
              <span className="landing-level-copy">{item.detail}</span>
              <span className="landing-tags">
                {item.tags.map((tag) => (
                  <i key={tag}>{tag}</i>
                ))}
              </span>
              <span className="landing-level-bottom">
                <b>{counts[item.id] || 0} QUESTIONS</b>
                <span>{busy ? "Loading…" : "Start playing ↗"}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-how">
        <div className="landing-how-intro">
          <SectionLabel>YOUR OWN LITTLE PACE</SectionLabel>
          <h2>Practice that feels good.</h2>
          <p>
            No pressure and no boring worksheets. Just a friendly place to
            think, try, and grow.
          </p>
        </div>
        <div className="landing-how-steps">
          <article>
            <b>01</b>
            <div>
              <strong>Pick your path</strong>
              <p>Choose a play style and a level that feels right.</p>
            </div>
          </article>
          <article>
            <b>02</b>
            <div>
              <strong>Try it your way</strong>
              <p>Take a hint, build an expression, or race the clock.</p>
            </div>
          </article>
          <article>
            <b>03</b>
            <div>
              <strong>Celebrate progress</strong>
              <p>Your rounds and personal best live in your dashboard.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="landing-reminder">
        <span>✳</span>
        <div>
          <small>A SMALL REMINDER</small>
          <h2>Getting it wrong is part of getting it right.</h2>
          <p>
            Every try teaches you something. That’s how brilliant brains are
            made.
          </p>
        </div>
        <span className="reminder-star">✦</span>
      </section>
    </div>
  );
}
