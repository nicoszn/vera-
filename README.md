## 🤖 vera
An enterprise-grade, monorepo-structured autonomous LLM platform. vera couples a stateless Next.js 16 frontend user interface (hosted on Vercel) with a continuous, long-running orchestration Agent Engine (hosted on Railway).
The infrastructure is linked through a centralized, single-source-of-truth PostgreSQL database using a zero-dependency unified data layer.
------------------------------
## 📐 System Architecture

                    ┌──────────────────────────────────────────────┐
                    │               Vercel Platform                │
                    │   ┌──────────────────┐    ┌───────────────┐  │
 ─── User (UI) ────►│   │ Next.js Frontend │    │  AI SDK v7    │  │
                    │   └────────┬─────────┘    └───────┬───────┘  │
                    └────────────│──────────────────────│──────────┘
                                 │                      │
                   (Write JSON)  │                      │ (Read State)
                                 ▼                      ▼
                    ┌──────────────────────────────────────────────┐
                    │         Central Shared PostgreSQL            │
                    │         (Managed on Railway Cloud)           │
                    └──────────────────────▲───────────────────────┘
                                           │
                                           │ (Continuous Poll & Mutate)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         Railway Compute Node Container       │
                    │   ┌──────────────────────────────────────┐   │
                    │   │        Autonomous Agent Engine       │   │
                    │   │    - OpenRouter (Claude/DeepSeek)    │   │
                    │   │    - Local System Execution MCP      │   │
                    │   └──────────────────────────────────────┘   │
                    └──────────────────────────────────────────────┘

------------------------------
## 📂 Project Structure

vera/
├── pnpm-workspace.yaml             # Core Monorepo workspace linking rules
├── package.json                    # Workspace dependencies & execution rules
├── .gitignore                      # Formatted for Node 22, Next 16, & Prisma 7
├── prisma/                         
│   └── schema.prisma               # Database engine single source of truth
├── .github/
│   └── workflows/
│       └── db-sync.yml             # Headless cloud schema push engine
├── libs/                           
│   └── db/                         # UNIFIED CENTRAL DATABASE UTILITY (@workspace/db)
│       ├── index.ts                # Entry-point database cache connector
│       └── package.json            
├── apps/
│   └── web/                        # FRONTEND CONTROL APPLICATION (Vercel)
│       ├── app/
│       │   ├── api/
│       │   │   ├── run-agent/
│       │   │   │   └── route.ts    # Task ingestion layer
│       │   │   └── agent-status/
│       │   │       └── route.ts    # UI polling tracking layer
│       │   ├── globals.css         # CSS-First Tailwind v4 settings
│       │   ├── layout.tsx          
│       │   └── page.tsx            # Operational dashboard UI console
│       ├── postcss.config.mjs      # Tailwind v4 Native Oxide compilation hook
│       ├── tsconfig.json           # Strict TS v6 client rules
│       └── package.json            
└── services/
    └── agent-engine/               # LONG LIVED BACKGROUND NODE (Railway)
        ├── src/
        │   ├── mcp-server.ts       # Secure shell manipulation tools
        │   └── index.ts            # Core polling loop agent orchestrator
        ├── Dockerfile              # Immutable packaging container
        ├── tsconfig.json           # Strict TS v6 backend rules
        └── package.json            

------------------------------
## ⚡ Tech Stack Specifications

* Language Platform: TypeScript v6.0.0 (Strict mode type definitions)
* Frontend Runtime: Next.js 16.2.4 (React 19, Stateless App Router)
* Styling Core: Tailwind CSS v4.0.0 (CSS-First design architecture via PostCSS Oxide)
* Database Mapping: Prisma 7.9.1 (Using native Rust-free TypeScript engine prisma-client)
* AI Toolbelt: AI SDK v7.0.4 & @ai-sdk/openai v4.0.4 (Multi-step looping constructs)
* Validation: Zod v4.4.3 (Pure type transformations)
* Compute Isolation: Node 22-slim (Debian system dependencies base layers)

------------------------------
## ☁️ Deployment Pipeline & Orchestration
Because vera operates on a zero-local-build methodology, compiling, migrating, and updating happen entirely within cloud-native build containers triggered on every GitHub commit.
## 1. Database Schema Synchronization
Since you cannot execute migrations manually, a GitHub Actions workflow handles live schema updates automatically.

* Whenever a modification to prisma/schema.prisma is pushed to the main branch, a container environment initializes on GitHub.
* It downloads the source variables and fires npx prisma db push --accept-data-loss.
* This matches your production PostgreSQL cluster structure instantly to your definitions without downing active processes.

## 2. Next.js Frontend Compilation (Vercel)

* Vercel hooks into your apps/web/package.json setup.
* The explicit postinstall life-cycle instruction triggers prisma generate.
* This creates the TypeScript typing interfaces inside your workspace before Next.js compiles, eliminating Module Not Found errors.

## 3. Asynchronous Worker Engine (Railway)

* Railway picks up the project and routes compilation instructions through the root services/agent-engine/Dockerfile.
* The multi-stage script initializes system libraries (like OpenSSL), registers code states, generates the engine dependencies via the unified workspace folder, and spins up a persistent, active node dist/index.js daemon thread.

------------------------------
## 🔧 Environment Variable Configurations
To link vera successfully, you must specify these configuration parameters across your system platforms:
## A. GitHub Secret Settings
Navigate to your repository Settings -> Secrets and variables -> Actions and create:

* RAILWAY_DATABASE_URL: The public connection URI generated by your PostgreSQL instance on Railway.

## B. Vercel Project Settings
Under your application dashboard, add these specific variables:

* DATABASE_URL: The public connection URI generated by your PostgreSQL instance on Railway.

## C. Railway Service Settings
Under your agent-engine container execution card, specify these configuration targets:

* DATABASE_URL: Set this to ${{PostgreSQL.DATABASE_URL}} (Railway's internal ultra-low latency connection shortcut string).
* OPENROUTER_API_KEY: Your private OpenRouter access token (sk-or-...).

------------------------------
## 📈 Operational Communication Flow

   1. User Request: The operator keys an objective target configuration sequence into the dashboard at apps/web.
   2. Task Storage: The /api/run-agent pipeline records a clean JSON representation of this task inside the agent_tasks table, establishing it as PENDING.
   3. Engine Claims Job: The continuous backend application services/agent-engine flags the entry, mutates its flag to RUNNING, and provisions tool handles.
   4. Autonomous Loops: The model utilizes structural Model Context Protocol shell utilities step-by-step (maxSteps: 15), appending every thought processing block directly into the live log rows.
   5. Real-time Streaming UI: The Next.js control desk polls /api/agent-status every 1500ms, streaming raw terminal logs straight to the viewer's screen. Once completed, the final environment results render instantly.

