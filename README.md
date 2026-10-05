# Student Life — Next.js

The existing student dashboard now runs on Next.js App Router, React and Tailwind CSS.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Stop an existing server with Ctrl+C before restarting. To use another port: `npm run dev -- --port 3001`.

```sh
npm run lint
npm run build
npm start
```

## Structure

```text
app/
  (public)/
    page.jsx
    about/page.jsx
    contact/page.jsx
  dashboard/page.jsx
  api/
    auth/login/route.js
    auth/register/route.js
    users/route.js
    products/route.js
    orders/route.js
  layout.jsx
  globals.css
components/
  ui/
  common/
  forms/
  dashboard/
lib/
  db.js
  auth.js
  validations.js
  utils.js
models/
  User.js
  Product.js
  Order.js
services/
  user.service.js
  product.service.js
  order.service.js
hooks/
middleware.js
public/
.env.local
.gitignore
next.config.js
package.json
README.md
```

Supporting files: `postcss.config.js` configures Tailwind, `eslint.config.mjs` configures lint checks, and `package-lock.json` locks dependencies. Next.js generates `.next/`. The ignored `data/` directory retains existing fallback records. Vite's old src, dist, server and configuration have been archived outside the project.

The patched Next.js 15 release line preserves the requested `middleware.js` convention. PostCSS uses a compatible patched 8.x override.

## Pages and features

Both `/` and `/dashboard` open the existing Student Life interface. `/about` describes the app; `/contact` opens the existing feedback form. All previous dashboard tabs and dialogs are retained. Browser state initializes after hydration, preserving existing `student_life_*` localStorage keys and saved data.

Navigation and notifications are in `components/common`; forms and setup dialogs are in `components/forms`; views and study tools are in `components/dashboard`.

## API compatibility

Login, register and users use Next.js route handlers. Business logic is in `services/user.service.js`, with native Web Responses and shared JSON validation. Existing authentication behavior is retained; this conversion does not redesign it.

Next.js internally rewrites the following existing URLs to the users route dispatcher, preserving the requested API folder structure:

- `/api/routine`
- `/api/student-ai`
- `/api/students/sync`
- `/api/config`
- `/api/feedback`

Products and orders were not part of the original student app. Their requested model, service and route files are reserved read-only collection endpoints, requiring the verified Admin session. They return empty lists when no records exist. No commerce interface or checkout is added.

## Environment and storage

For a new checkout, copy `.env.example` to `.env.local`. Existing connection settings were moved to the ignored `.env.local` during migration.

- `MONGODB_URI`: connection string; leave empty for local storage.
- `MONGODB_DB_NAME`: defaults to `student_life`.
- `GEMINI_API_KEY`: server-only Student AI key.
- Admin email/password login and optional Google login: see [ADMIN_SETUP.md](ADMIN_SETUP.md). The legacy `ADMIN_SECRET` passcode is disabled.
- `ADMIN_CONTACT_EMAIL`: support email.
- `DATA_DIR`: optional persistent storage directory, defaults to `data`.

MongoDB connection failures fall back to `data/store.json`, preserving the existing format. Local storage needs a persistent writable directory; serverless deployments should use MongoDB. Do not commit credentials or student records.

## Verification

Use the lint and production build commands above. Check navigation, saved tasks after refresh, theme switching, contact feedback and login/register. Live MongoDB and AI functionality depend on working external credentials and connectivity.

## Admin Control System

The integrated `/admin` panel uses a server-verified Admin email/password, optional verified Google sign-in, persistent backend sessions, GridFS PDF storage, routine publishing, scoped chapter notes, additive syllabus management, reports and suggestions. Existing student data and local progress stay intact. Setup, storage changes, file inventory, tests and limitations are documented in [ADMIN_SETUP.md](ADMIN_SETUP.md). Run `npm run test:admin` for isolated backend and progress regression tests.
