"use client";
import { useEffect, useRef, useState } from "react";
import { knowledge } from "../lib/knowledge";
import {
  cloudEnabled,
  login,
  logout,
  observeAuth,
  saveFeedback,
} from "../lib/firebase";
const labels = {
  en: {
    welcome: "A helpful answer starts here.",
    intro: "Ask about getting started, deployment, account access, or billing.",
    message: "Your message",
    send: "Send message",
    wait: "Finding an answer…",
    empty: "What can we help you with?",
    clear: "Clear conversation",
  },
  es: {
    welcome: "Una buena respuesta empieza aquí.",
    intro: "Pregunta sobre proyectos, implementación, acceso o facturación.",
    message: "Tu mensaje",
    send: "Enviar mensaje",
    wait: "Buscando respuesta…",
    empty: "¿Cómo podemos ayudarte?",
    clear: "Borrar conversación",
  },
  fr: {
    welcome: "Une bonne réponse commence ici.",
    intro:
      "Posez une question sur les projets, le déploiement, les comptes ou la facturation.",
    message: "Votre message",
    send: "Envoyer",
    wait: "Recherche en cours…",
    empty: "Comment pouvons-nous vous aider ?",
    clear: "Effacer la conversation",
  },
};
export default function Support() {
  const [language, setLanguage] = useState("en"),
    [messages, setMessages] = useState([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [user, setUser] = useState(null);
  const log = useRef(null);
  const t = labels[language];
  useEffect(() => {
    try {
      setMessages(JSON.parse(localStorage.getItem("support-chat-v1") || "[]"));
    } catch {}
    setReady(true);
    if (cloudEnabled) return observeAuth(setUser, (e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("support-chat-v1", JSON.stringify(messages));
      } catch {
        setError("Browser storage is full.");
      }
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "instant",
    });
  }, [messages, ready, busy]);
  async function send(e) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const question = input.trim();
    const next = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: question },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
          language,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          ...data,
          question,
        },
      ]);
    } catch (e) {
      setError(e.message);
      setMessages(messages);
      setInput(question);
    } finally {
      setBusy(false);
    }
  }
  async function rate(m, rating) {
    setError("");
    try {
      const entry = {
        rating,
        question: m.question,
        answer: m.content.slice(0, 16000),
        createdAt: new Date().toISOString(),
      };
      if (user) await saveFeedback(user.uid, m.id, entry);
      else {
        const ratings = JSON.parse(
          localStorage.getItem("support-feedback-v1") || "{}",
        );
        ratings[m.id] = entry;
        localStorage.setItem("support-feedback-v1", JSON.stringify(ratings));
      }
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, rating } : x)),
      );
    } catch (e) {
      setError("Feedback could not be saved. Please try again.");
    }
  }
  return (
    <>
      <header>
        <a className="brand" href="/">
          <span>H</span>support studio.
        </a>
        <div className="row">
          <label>
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </label>
          {cloudEnabled && (
            <button
              className="secondary small"
              onClick={() => {
                setError("");
                (user ? logout() : login()).catch((e) => setError(e.message));
              }}
            >
              {user ? "Sign out" : "Sign in with Google"}
            </button>
          )}
        </div>
      </header>
      <main id="main">
        <p className="eyebrow">Headstarter / Here to help</p>
        <h1>{t.welcome}</h1>
        <p className="intro">{t.intro}</p>
        <div className="columns">
          <section className="panel">
            <div className="row between">
              <span className="badge">Knowledge-grounded support</span>
              <button
                className="secondary small"
                disabled={busy}
                onClick={() => setMessages([])}
              >
                {t.clear}
              </button>
            </div>
            <p className="muted">
              <small>
                Demo product policies. Gemini is used only when configured.
                Messages are saved in this browser.
              </small>
            </p>
            <div
              ref={log}
              className="chat-log"
              role="log"
              aria-label="Conversation"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="empty">
                  <h2>{t.empty}</h2>
                  <p>Try “How do I deploy my project?”</p>
                </div>
              )}
              {messages.map((m) => (
                <article key={m.id} className={`message ${m.role}`}>
                  <small>
                    {m.role === "user"
                      ? "You"
                      : `Assistant · ${m.mode === "gemini" ? "Gemini" : "Knowledge base"}`}
                  </small>
                  <div>{m.content}</div>
                  {m.sources?.length > 0 && (
                    <div className="sources">
                      Sources:{" "}
                      {m.sources.map((s) => (
                        <a
                          style={{ marginRight: 8 }}
                          key={s.id}
                          href={`#${s.id}`}
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" && (
                    <div
                      className="row"
                      style={{ marginTop: 10 }}
                      aria-label="Rate this answer"
                    >
                      <small>{m.rating ? "Rating saved" : "Helpful?"}</small>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          className="secondary small"
                          key={n}
                          aria-label={`Rate answer ${n} out of 5`}
                          aria-pressed={m.rating === n}
                          onClick={() => rate(m, n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
              {busy && <p role="status">{t.wait}</p>}
            </div>
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <form onSubmit={send} className="stack">
              <label>
                {t.message}
                <textarea
                  required
                  maxLength={4000}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell us what you're working on…"
                />
              </label>
              <button disabled={busy || !input.trim()}>{t.send} ↗</button>
            </form>
          </section>
          <aside className="stack">
            <div className="panel">
              <p className="eyebrow">An open book</p>
              <h2>Our knowledge base</h2>
              <p className="muted">
                Every answer starts with these documents. Expand one to see
                exactly what the assistant knows.
              </p>
              {knowledge.map((k) => (
                <details id={k.id} className="item" key={k.id}>
                  <summary>{k.title}</summary>
                  <p>{k.text}</p>
                </details>
              ))}
            </div>
            <div className="notice">
              Need a person?{" "}
              <a href="mailto:saikarthikbattula@gmail.com">
                Contact Sai Karthik
              </a>
              .
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        Headstarter project 03 · Transparent answers. Clear next steps.
      </footer>
    </>
  );
}
