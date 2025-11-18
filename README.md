# Skill4Hire-frontend

Skill4Hire is a multi-tenant job marketplace that serves candidates, employers, and internal hiring teams from a single React application. This repository contains the entire frontend: shared authentication flows, role-specific dashboards, and the automation scripts we use to verify common job posting journeys.

## ✨ Highlights
- **Unified onboarding** – shared login, registration, and role detection for candidates, companies, and employees.
- **Dedicated workspaces** – focused dashboards for job seekers (applications & matches), employers (job postings & applicants), and HR employees (candidate recommendations).
- **API-driven UI** – Axios client with credential support, toast-friendly error handling, and route guards on 401/403 responses.
- **Modern tooling** – React 19, Vite 7, React Router 7, and SWC-powered fast refresh for a tight feedback loop.

## 🧱 Project Structure
The actual React app lives inside the `Skill4Hire/` directory.

```
Skill4Hire-frontend/
├── README.md                # (this file)
└── Skill4Hire/
	├── package.json        # scripts & dependencies
	├── src/
	│   ├── App.jsx         # route shell & layout
	│   ├── assets/         # images and shared media
	│   ├── Candidate/      # candidate portal screens
	│   ├── Company/        # employer dashboard + forms
	│   ├── Employee/       # staffing/HR tools
	│   ├── components/     # shared UI (modals, badges, etc.)
	│   ├── services/       # API helpers (axios wrappers)
	│   └── utils/          # axios config and helpers
	├── public/             # static assets served by Vite
	└── vite.config.js
```

## 🛠 Tech Stack
- React 19 + React DOM 19
- Vite 7 with `@vitejs/plugin-react-swc`
- React Router 7
- Axios (with cookie jar support for Node smoke tests)
- ESLint 9

## 🚀 Getting Started
> All commands below are executed from the `Skill4Hire/` folder.

### 1. Prerequisites
- Node.js 18+ (recommended LTS)
- npm 9+ (ships with current Node LTS)

### 2. Install dependencies
```bash
cd Skill4Hire
npm install
```

### 3. Run the dev server
```bash
npm run dev
```
The Vite dev server boots on [http://localhost:5714](http://localhost:5714) by default and proxies API calls to the backend specified in `src/utils/axiosConfig.jsx`.

### 4. Production build & preview
```bash
npm run build
npm run preview
```
`npm run build` outputs static assets to `Skill4Hire/dist`. `npm run preview` serves that bundle so you can sanity-check the build locally.

## ⚙️ Configuration & Environment
- **API endpoints** – During development the Axios client points to `http://localhost:5714`; production builds default to `https://skill4hire-backend.onrender.com`. Update `src/utils/axiosConfig.jsx` if your backend lives elsewhere or wire it up to `import.meta.env` variables.
- **Authentication state** – `localStorage` keeps `userRole`, `userId`, and `companyId`. Clearing storage forces a fresh login.
- **Port conflicts** – change the dev port by editing the `dev` script in `Skill4Hire/package.json` (defaults to `vite --port 5714`).

## 📜 npm Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Starts Vite in development mode with fast refresh. |
| `npm run build` | Produces an optimized production bundle in `dist/`. |
| `npm run preview` | Serves the production bundle locally (good for smoke tests). |
| `npm run lint` | Runs ESLint across all source files. |
| `npm run test:job-flow` | Executes `scripts/jobFlowSmoke.js`, an end-to-end API smoke test for job creation/search/deletion. |


| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Backend REST root (defaults to `http://localhost:8080`). |
| `COMPANY_EMAIL` / `COMPANY_PASSWORD` | Credentials used to create and optionally delete a job posting. |
| `CANDIDATE_EMAIL` / `CANDIDATE_PASSWORD` | Credentials used to search for the created posting. |
| `KEEP_JOB` | Set to `true` to leave the created job in the system instead of deleting it. |

## 🧭 Development Tips
- Each role-specific area lives under its own folder (`src/Candidate`, `src/Company`, `src/Employee`). Shared UI (like `PortalLogoBadge`, unified login components, and modal primitives) sit under `src/components`.
- API helpers in `src/services` centralize error handling; import them instead of calling Axios directly inside components.
- `src/utils/axiosConfig.jsx` intercepts 401/403 responses and automatically redirects to `/login`, so you rarely need to add manual guards inside views.

## 🤝 Contributing
1. Fork or create a feature branch off `SCRUM-176-maintain-a-consistent-ui-across-all-3-profiles` (current working branch).
2. Make your changes inside `Skill4Hire/` (the Vite app root).
3. Run `npm run lint` and, if relevant, `npm run test:job-flow` before opening a PR.
4. Describe any backend/API expectations so reviewers can reproduce your setup.

---
Need backend details, environment help, or screenshots for release notes? Check the documentation inside `Skill4Hire/COMPANY_API_SIMPLIFIED.md` or open a discussion on the project board.

