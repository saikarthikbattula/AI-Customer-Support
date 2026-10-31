// Demo product documentation. Replace these records with your verified company policies before public use.
export const knowledge = [
  {
    id: "getting-started",
    title: "Start a project",
    category: "technical",
    text: "Create a project, write down the user problem, and build the smallest useful version. Run it locally before deploying. The five Headstarter practice projects are a portfolio, pantry tracker, support chatbot, flashcards, and professor assistant.",
  },
  {
    id: "deployment",
    title: "Deploying your app",
    category: "technical",
    text: "For Next.js projects, install dependencies, run npm run build, and set server environment variables in your hosting dashboard. Never put Gemini keys in NEXT_PUBLIC variables. Vercel can deploy from a Git repository; an EC2 host can run the supplied Docker image.",
  },
  {
    id: "account-access",
    title: "Account access",
    category: "account",
    text: "Use Sign in with Google if Firebase authentication is configured. If a popup is blocked, allow popups for this site. If access fails, check the authorized domain and enabled Google sign-in provider in Firebase. This demo cannot reset passwords or access private account data.",
  },
  {
    id: "billing",
    title: "Billing and refunds",
    category: "billing",
    text: "This support studio is a demo and has no paid plan. It cannot look up transactions, change subscriptions, or promise refunds. For the separate Recall flashcard app, use its Stripe customer portal to manage an active subscription. Contact the app owner for a payment question.",
  },
  {
    id: "privacy",
    title: "Data and privacy",
    category: "account",
    text: "Without Firebase configuration, conversations and feedback stay in this browser. When Gemini is configured, recent chat messages are sent to Google for response generation. Signed-in feedback is saved in your user-scoped Firestore collection. Never include secrets or sensitive personal information.",
  },
  {
    id: "contact",
    title: "Talk to a person",
    category: "general",
    text: "For help with this project, contact Sai Karthik Battula at saikarthikbattula@gmail.com. Include what you tried and the visible error, without passwords or API keys.",
  },
];
const stop = new Set([
  "how",
  "do",
  "i",
  "my",
  "the",
  "a",
  "an",
  "to",
  "is",
  "can",
  "you",
  "me",
  "what",
  "with",
  "and",
  "for",
]);
const tokens = (s) =>
  new Set(
    (s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
      .filter((w) => !stop.has(w))
      .map((w) => (w.startsWith("deploy") ? "deploy" : w.replace(/s$/, ""))),
  );
export function route(question) {
  if (/bill|refund|payment|subscription|factur|reembolso/i.test(question))
    return "billing";
  if (/login|sign.?in|account|password|compte|cuenta|privacy/i.test(question))
    return "account";
  if (
    /deploy|error|api|project|code|projet|proyecto|environment/i.test(question)
  )
    return "technical";
  return "general";
}
export function retrieve(question) {
  const words = tokens(question);
  const category = route(question);
  return knowledge
    .map((k) => ({
      ...k,
      score:
        [...words].reduce(
          (total, w) =>
            total +
            (tokens(k.title).has(w) ? 3 : tokens(k.text).has(w) ? 1 : 0) *
              Math.log(1 + knowledge.length / Math.max(1, knowledge.filter(d => tokens(d.title + " " + d.text).has(w)).length)),
          0,
        ) + (category !== "general" && k.category === category ? 2 : 0),
    }))
    .filter((k) => k.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
export function demoAnswer(question, language = "en") {
  const docs = retrieve(question);
  const intro = {
    en: "Demo answer from the knowledge base:",
    es: "Respuesta de demostración de la base de conocimientos (documentos en inglés):",
    fr: "Réponse de démonstration de la base de connaissances (documents en anglais) :",
  }[language];
  return {
    answer: docs.length
      ? `${intro}\n\n${docs.map((k) => k.text).join("\n\n")}`
      : {
          en: "I do not have a verified answer for that. Contact the project owner at saikarthikbattula@gmail.com.",
          es: "No tengo una respuesta verificada. Contacta con saikarthikbattula@gmail.com.",
          fr: "Je ne dispose pas de réponse vérifiée. Contactez saikarthikbattula@gmail.com.",
        }[language],
    sources: docs.map(({ id, title }) => ({ id, title })),
    route: route(question),
    mode: "demo",
  };
}
