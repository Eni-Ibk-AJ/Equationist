import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import SectionLabel from "../components/SectionLabel.jsx";
import "../styles/admin.css";

const emptyQuestion = () => ({
  difficulty: "easy",
  prompt: "",
  answer: "",
  hint: "",
  variable: "",
  sort_order: 0,
  is_active: true,
});

export default function AdminPage({ currentUser, onBack }) {
  const [tab, setTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [draft, setDraft] = useState(emptyQuestion());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    const [questionData, userData, summary] = await Promise.all([
      api("/questions/admin"),
      api("/admin/users"),
      api("/admin/overview"),
    ]);
    setQuestions(questionData.questions);
    setUsers(userData.users);
    setOverview(summary);
  }, []);
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);

  function clearDraft() {
    setEditingId(null);
    setDraft(emptyQuestion());
  }
  async function saveQuestion(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...draft,
        answer: Number(draft.answer),
        sort_order: Number(draft.sort_order),
        hint: draft.hint || null,
        variable: draft.variable || null,
      };
      await api(
        editingId ? `/questions/admin/${editingId}` : "/questions/admin",
        { method: editingId ? "PATCH" : "POST", body },
      );
      clearDraft();
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteQuestion(id) {
    if (!window.confirm("Delete this question from the bank?")) return;
    try {
      await api(`/questions/admin/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  async function updateUser(person, field, value) {
    const body = {
      role: field === "role" ? value : person.role,
      status: field === "status" ? value : person.status,
    };
    try {
      await api(`/admin/users/${person.id}`, { method: "PATCH", body });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  function editQuestion(item) {
    setEditingId(item.id);
    setDraft({
      ...item,
      answer: String(item.answer),
      hint: item.hint || "",
      variable: item.variable || "",
      is_active: Boolean(item.is_active),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="admin-page page-enter">
      <div className="admin-heading">
        <div>
          <button type="button" className="auth-back" onClick={onBack}>
            ← Back to dashboard
          </button>
          <SectionLabel>PLATFORM ADMIN</SectionLabel>
          <h1>Shape the next challenge.</h1>
          <p>Keep the question bank fresh and manage who can play.</p>
        </div>
        <div className="admin-heading-mark">✳</div>
      </div>
      <div className="admin-overview">
        {[
          ["Players", overview?.users?.total_users],
          ["Active questions", overview?.questions?.active_questions],
          ["Rounds played", overview?.sessions?.total_sessions],
        ].map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
          </article>
        ))}
      </div>
      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "questions" ? "selected" : ""}
          onClick={() => setTab("questions")}
        >
          Question bank <span>{questions.length}</span>
        </button>
        <button
          type="button"
          className={tab === "users" ? "selected" : ""}
          onClick={() => setTab("users")}
        >
          Accounts <span>{users.length}</span>
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {tab === "questions" ? (
        <div className="admin-workspace">
          <form className="question-editor" onSubmit={saveQuestion}>
            <div className="editor-heading">
              <div>
                <SectionLabel>
                  {editingId ? "EDIT QUESTION" : "QUESTION EDITOR"}
                </SectionLabel>
                <h2>
                  {editingId ? "Update a challenge" : "Add a new challenge"}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={clearDraft}
                >
                  Cancel edit
                </button>
              )}
            </div>
            <div className="editor-grid">
              <label>
                Difficulty
                <select
                  value={draft.difficulty}
                  onChange={(e) =>
                    setDraft({ ...draft, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <label>
                Correct numeric answer
                <input
                  type="number"
                  step="any"
                  value={draft.answer}
                  onChange={(e) =>
                    setDraft({ ...draft, answer: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Variable (optional)
                <input
                  value={draft.variable}
                  onChange={(e) =>
                    setDraft({ ...draft, variable: e.target.value })
                  }
                  maxLength="32"
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min="0"
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft({ ...draft, sort_order: e.target.value })
                  }
                />
              </label>
              <label className="editor-wide">
                Question prompt
                <textarea
                  value={draft.prompt}
                  onChange={(e) =>
                    setDraft({ ...draft, prompt: e.target.value })
                  }
                  maxLength="1000"
                  required
                />
              </label>
              <label className="editor-wide">
                Helpful hint
                <textarea
                  value={draft.hint}
                  onChange={(e) => setDraft({ ...draft, hint: e.target.value })}
                  maxLength="2000"
                />
              </label>
              <label className="editor-active">
                <input
                  type="checkbox"
                  checked={Boolean(draft.is_active)}
                  onChange={(e) =>
                    setDraft({ ...draft, is_active: e.target.checked })
                  }
                />{" "}
                Show in the game
              </label>
            </div>
            <button
              type="submit"
              className="button button-dark"
              disabled={busy}
            >
              {busy ? "Saving…" : editingId ? "Save changes" : "Add question"}{" "}
              <span>→</span>
            </button>
          </form>
          <section className="admin-question-list">
            <div className="question-list-title">
              <SectionLabel>THE BANK</SectionLabel>
              <span>{questions.length} total</span>
            </div>
            {questions.map((item) => (
              <article
                className={`admin-question ${item.is_active ? "" : "inactive"}`}
                key={item.id}
              >
                <div className="question-card-top">
                  <span className={`session-level level-${item.difficulty}`}>
                    {item.difficulty}
                  </span>
                  <span className="question-active">
                    {item.is_active ? "In game" : "Hidden"}
                  </span>
                </div>
                <p>{item.prompt}</p>
                <small>
                  Answer: {item.answer}
                  {item.hint ? ` · Hint: ${item.hint}` : ""}
                </small>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() => editQuestion(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-text-button danger"
                    onClick={() => deleteQuestion(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <section className="admin-users-panel">
          <div className="admin-users-head">
            <div>
              <SectionLabel>ACCOUNT MANAGEMENT</SectionLabel>
              <h2>Players and access</h2>
            </div>
            <p>Roles and access changes take effect right away.</p>
          </div>
          {users.map((person) => (
            <article className="admin-user-row" key={person.id}>
              <div className="admin-person-avatar">
                {person.display_name.slice(0, 1).toUpperCase()}
              </div>
              <div className="admin-person-info">
                <strong>
                  {person.display_name}
                  {Number(person.id) === Number(currentUser.id) && <i>You</i>}
                </strong>
                <span>
                  {person.email} · {person.rounds_played} rounds
                </span>
              </div>
              <label>
                Role
                <select
                  value={person.role}
                  disabled={Number(person.id) === Number(currentUser.id)}
                  onChange={(e) => updateUser(person, "role", e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={person.status}
                  disabled={Number(person.id) === Number(currentUser.id)}
                  onChange={(e) => updateUser(person, "status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
