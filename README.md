# Headstarter Support Studio

Live app: https://headstarter-support.vercel.app

A Next.js support assistant with Gemini, source-grounded retrieval, transparent documentation, English/Spanish/French UI, and saved response ratings.

## Run

Node 22+: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. `npm test` covers retrieval, role validation, malformed requests, and mocked Gemini transport. `npm run build` creates production output.

Without a Gemini key, the endpoint returns labeled excerpts from the demo knowledge base; translated UI does not pretend the English documents have been translated. With `GEMINI_API_KEY`, Gemini answers in the selected language and receives at most 20 bounded recent messages. No other AI provider is used.

## Retrieval and routing

`lib/knowledge.js` contains demo product policies. Replace them with verified documentation before a real customer launch. Keyword retrieval selects up to three relevant documents. A deterministic router selects technical, account, billing, or general queues; billing can use a separate `GEMINI_BILLING_MODEL`. Responses include source records and refuse unsupported questions rather than inventing policies. This is lexical retrieval augmented generation, not semantic/vector retrieval. The router is rule-based, not a model-based orchestration agent.

Conversations and unsigned feedback stay in browser storage. Configure all four Firebase web variables, enable Google sign-in, authorize the host, and deploy `firestore.rules` to save signed-in feedback under `users/{uid}/feedback`. Authentication restoration uses Firebase's auth observer. UI reports failed saves. User-owned Firestore read/write and access restrictions were verified with live test data; a complete real-user Google sign-in workflow still needs a user sign-in check.

## Deploy

Vercel: import the repository, add environment variables, and use Next.js defaults. GitHub Actions verifies tests/build. EC2: install Docker on your host, build this repository's Dockerfile, supply public Firebase settings as build args if needed, and run it with server environment variables and port 3000 behind a TLS reverse proxy. Configure health checks at `/api/health`. The app uses Gemini only; Bedrock from the original exercise is intentionally superseded by the user's provider requirement.

Do not place keys in client variables. Key logging from the old endpoint has been removed. Rotate any key previously exposed in hosting logs. Current request limits are per process; use trusted ingress, a shared rate limiter, and provider spend controls for a public launch. The application is deployed to Vercel. The EC2/container instructions have not been exercised against a live host.
