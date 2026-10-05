# Student Life Admin setup and implementation

The integrated panel is at `/admin`, also accessible through the existing Profile → Admin Portal entry. The only authorized account is **hridoy.dev.natore@gmail.com**. Sign in using its separate Student Life Admin password. Google login remains optional. Public contact settings do not change this authorization or the notification recipient.

## Ready-to-use local email/password login

Open `http://localhost:3000/admin`. Use the Admin email above and the owner-configured password saved in the private, git-ignored `.admin-password.txt` file in the project root. This is a separate website password, not your Gmail password. There is no default/shared password in application code.

The server stores only a salted scrypt hash in `.env.local` as `ADMIN_PASSWORD_HASH`. Password verification uses constant-time comparison, and login attempts are rate limited. Sessions are opaque random tokens in HttpOnly cookies; the backend stores only their hashes. Changing the password hash invalidates existing password sessions. No normal student registration/profile can grant Admin access.

This local checkout uses `ADMIN_SESSION_STORE=local`, storing expiring sessions and login limits in `data/admin-auth.json` on the backend, independently of the existing student data. It needs a single persistent writable server and is rejected on recognized serverless hosts. For production MongoDB-backed sessions, configure `ADMIN_SESSION_STORE=mongodb` and a working MongoDB connection. HTTPS is still required for production origins. Local session storage only supports authentication: shared PDFs/content continue to require MongoDB/GridFS and never silently switch to local publication storage.

The current MongoDB connection was unavailable during verification. Email/password sign-in, the Admin shell, session refresh and logout were verified against the running site without MongoDB. Content management reports a database error until the connection is restored; uploads/publication have not been enabled through an insecure substitute.

Reference for password hashing: [Node.js scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).

## Before running

Keep your existing `.env.local`, database records and browser localStorage. Add the variables below; do not replace the file or commit it. Restart Next.js after changing environment variables.

```dotenv
MONGODB_URI=<your existing working MongoDB connection>
MONGODB_DB_NAME=student_life
APP_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=<Google Web application client ID>
GOOGLE_CLIENT_SECRET=<Google Web application client secret>
ADMIN_SESSION_SECRET=<a random secret of at least 32 characters>
ADMIN_PASSWORD_HASH=<salted scrypt hash, already configured locally>
ADMIN_SESSION_STORE=mongodb
RESEND_API_KEY=<server-side Resend API key>
EMAIL_FROM=Student Life <notifications@your-verified-domain.example>
ADMIN_CONTACT_EMAIL=hridoy.dev.natore@gmail.com
```

Use the actual **HTTPS origin without a trailing slash** for `APP_ORIGIN` in production. HTTP is allowed only for localhost/127.0.0.1. Keep secrets server-side; never prefix them with `NEXT_PUBLIC_`. Generate `ADMIN_SESSION_SECRET` locally with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` and paste it into your ignored environment file.

`ADMIN_SECRET` is no longer used. An old passcode or `x-admin-token` cannot authorize Admin operations.

## Google Admin login

1. In Google Cloud, configure an OAuth consent screen and a **Web application** OAuth client. Use only the `openid` and `email` scopes. If the app is in testing mode, add the authorized Gmail as a test user.
2. Add the authorized redirect URI **exactly**: `http://localhost:3000/api/admin/auth/callback` locally, and `https://YOUR-DOMAIN/api/admin/auth/callback` in production. It must match `APP_ORIGIN`.
3. Put the client ID/secret and session secret in the server environment. Start the app, open `/admin`, and select the authorized Google account.

Login uses a server-side authorization-code exchange, PKCE and signed expiring state. The server retrieves Google's verified identity and checks the exact email address. It creates a random session whose hash is stored in MongoDB; the browser receives an HttpOnly, SameSite=Lax cookie, with Secure enabled on HTTPS. Sessions expire after eight hours and logout revokes them. Every private API checks the database session; mutation APIs also validate Origin. The Admin page checks the session on the server.

Missing Google configuration prevents Google login; the separately configured Admin email/password remains available. MongoDB session mode requires database connectivity; local session mode is explicitly configured rather than an automatic outage fallback. A regular student login, local profile email, simulated Google/OTP login or manually entered URL cannot grant Admin rights.

When OAuth configuration is missing, `/admin` displays setup steps and the exact redirect URI, and disables the Google sign-in button. Visiting `/api/admin/auth/start` directly returns to the sign-in page with guidance rather than displaying a JSON error. For the current local checkout, `APP_ORIGIN=http://localhost:3000` and a randomly generated session secret were added to the ignored `.env.local` while preserving existing settings. Add your real Google client ID/secret to the empty OAuth fields and restart the server; the secret is never displayed in the setup page.

Reference: [Google server OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server) and [verified Google identity](https://developers.google.com/identity/openid-connect/openid-connect).

## Email notifications

Create a Resend API key and verify a sender domain; set `RESEND_API_KEY` and `EMAIL_FROM`. Notifications are sent by the server to the authorized Gmail. A Gmail password is not required. Use a sender accepted by your Resend account.

Reports and suggestions are saved **before** email delivery. The Admin sees `sent`, `failed`, `not_configured`, or `pending` as the email status. A provider error or timeout does not remove the submission. Student details are marked self-reported because the existing student login is not a verified identity system. Submission limits use MongoDB counters, five submissions per source address per minute and 100 site-wide per minute; configure your proxy to overwrite `X-Forwarded-For` correctly.

Reference: [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

## Shared storage and publishing

Admin content requires a working MongoDB connection. MongoDB/GridFS is used instead of local filesystem uploads so files remain available across serverless instances and browser devices. Ensure the database account can read/write the new collections and create indexes.

New collections (existing collections are retained):

- `admin_sessions`: hashed tokens, verified Google identity and expiry; TTL index.
- `site_content`: PDF title/description, stable content ID and subject/paper/chapter references.
- `academic_pdfs.files` / `academic_pdfs.chunks`: GridFS PDF storage.
- `site_publication`: one atomic pointer to the current routine.
- `site_catalog`: additive shared syllabus catalog and revision number.
- `problem_reports` and `feature_suggestions`: separate submission stores and review status.
- `submission_limits`: rate limit counters; TTL index.

The existing `config` record remains available for public support email settings. Existing MongoDB feedback is displayed in the relevant report/suggestion section, without a migration; other feedback remains accessible. The student directory and its search remain available and return only basic profile fields.

Routine flow: upload → validate/save as unpublished → open PDF → publish. Publishing a new routine changes only one pointer; old files remain available to the Admin until explicitly deleted. Unpublish the current routine before deleting it. Failed uploads do not move the pointer. Multiple chapter notes are supported. Notes require exact subject, paper and chapter IDs, with server-side relationship validation. Paper materials can be attached to the entire selected paper. Edit/replace operates only on the selected content record; drafts and unpublished files require an Admin session to open.

PDFs must have the `.pdf` extension, PDF MIME type, PDF header and end marker, and be no larger than 10 MB. Upload request bodies are bounded while streaming. Files are registered only after the upload completes. The UI reports progress, validation/save state and errors. File responses use nosniff and sandbox CSP. This is format/size validation, not a malware scanning service.

Reference: [MongoDB Node GridFS](https://www.mongodb.com/docs/drivers/node/current/crud/gridfs/).

## Student data safety

No existing database records or localStorage keys were deleted or reset. Existing syllabus names, imported/custom subjects, paper IDs, chapters, routine copies and student progress remain stored as before. New shared catalog additions merge by stable IDs and never replace existing names/status/revision/Undo fields or restore removed default chapters. Admin catalog management intentionally provides additions only, respecting the instruction not to rename/delete existing syllabus records.

Published notes and the current college routine load separately from personal student data. When a college routine is published, the Routine page defaults to that published version. The previous saved routine table, daily view and personal upload remain available in their tabs. Personal uploads are explicitly labeled as personal copies and cannot publish a college routine. Shared content refreshes on page load, window focus and once per minute. The existing 60-second Undo deadline remains persisted with chapter progress.

There is no student logout operation that clears progress. Student progress remains device/browser-local, as in the existing app; this change does not introduce cross-device progress sync. Clearing browser storage will still remove browser-local records. The existing student password login and simulated Google/OTP convenience flows have not been converted into verified student authentication, and cannot authorize Admin actions.

Existing backend JSON fallback records in `data/store.json` are preserved. Shared Admin operations do not fall back to that file during a MongoDB outage, avoiding split published content. Historical local-only records are not automatically copied to MongoDB. Existing local-only routine PDFs are not automatically published.

## Files

Added:

- `app/admin/page.jsx`
- `app/api/admin/[...path]/route.js`
- `app/api/content/route.js`
- `app/api/content/files/[id]/route.js`
- `components/dashboard/AdminDashboard.jsx`
- `components/dashboard/ChapterNotesModal.jsx`
- `lib/admin-security.js`
- `lib/admin-password.js`
- `lib/admin-session-store.js`
- `components/forms/AdminLoginForm.jsx`
- `lib/admin-content.js`
- `lib/feedback.js`
- `lib/submission-limit.js`
- `tests/admin-system.test.mjs`
- `ADMIN_SETUP.md`

Modified:

- `components/dashboard/AdminPortalModal.jsx`: existing entry now opens the integrated secure panel; directory/search, feedback and support settings live there.
- `components/dashboard/StudentLifeApp.jsx`: loads shared content and safely merges catalog additions.
- `components/dashboard/StudySection.jsx`: chapter Notes entry; existing status/Undo logic retained.
- `components/dashboard/ClassRoutineView.jsx`: currently published college PDF and clearly labeled personal copies.
- `components/dashboard/ProfileView.jsx`: Google Admin access label.
- `components/forms/HelpFeedbackModal.jsx`: separate report/suggestion actions, problem categories and submission errors.
- `lib/syllabus.js`: additive catalog merge.
- `lib/auth.js`: protects legacy Admin dispatcher and users endpoint against passcode/query bypass.
- `services/user.service.js`: secure feedback submission and legacy Admin checks; password fields excluded from user listings.
- `app/api/products/route.js`, `app/api/orders/route.js`: reserved private endpoints now require the verified Admin session.
- `next.config.js`: removes legacy Admin rewrites so the protected Admin route handles Admin URLs.
- `.env.example`, `package.json`, `README.md`: setup and verification commands.

## Verification

Run:

```sh
npm run test:admin
npm run lint
npm run build
```

Automated tests use isolated in-memory database/GridFS mocks and mocked email delivery; they do not change production data or send email. They cover authorization, expiry, signed OAuth state, CSRF, PDF validation, routine upload failure/publication, scoped note replacement/deletion, draft file privacy, report/suggestion persistence when email fails, review status, submission limits, additive syllabus preservation and the existing Undo/revision behavior.

Implementation verification: **12 automated tests passed**, including email/password verification, non-owner rejection, password-change session invalidation, persistent local sessions and login rate limits; lint passed. The initial Admin implementation passed production build. A headless Microsoft Edge check at a 390 × 844 mobile viewport also passed refresh persistence, Undo and expiry using a browser test clock, revision counts, chapter-note isolation, published routine display, absence of horizontal overflow/runtime errors, the protected login page, and rejection of direct/legacy Admin API access. The student browser check used isolated browser storage and mocked shared content/profile sync. Live local email/password login was separately tested with the generated owner credentials: sign-in, rejection of another email, refresh persistence, logout revocation, mobile layout and a 404 response for the private password file URL all passed.

Live Google sign-in, real GridFS delivery and real email delivery need the configured external services. After setup, verify:

1. Authorized Gmail signs in; another Google account is rejected. Direct private API requests without the Admin cookie return 401/403. Logout revokes the session.
2. Upload/publish a routine; open it on another student browser/mobile. Attempt an invalid upload; the previous routine remains published.
3. Upload several Physics notes, preview and publish them. They appear only under their selected Physics chapter. Chemistry and other chapters remain unaffected. Edit/replace/unpublish/delete one note and confirm the others remain.
4. Submit a problem report and feature suggestion. Review each in its separate section, change status, and check notification delivery. Disable the mail key temporarily and confirm submissions still save.
5. Keep saved chapters, import/custom syllabus, revision counts and personal routine copies; reload, sign in/out of Admin, and publish content. Student progress and the 60-second Undo deadline must remain intact.
6. Verify the Admin dashboard and PDF-opening links on the mobile browser you normally use. Native PDF rendering depends on the mobile browser.

Deployment upload limits must permit the configured 10 MB plus multipart overhead; if a host enforces a smaller hard request limit, use smaller PDFs or an appropriate hosting plan/storage integration. No deployment or external credentials were created by this implementation.
