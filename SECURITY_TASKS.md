# Security Audit Tasks

The following tasks address potential security weaknesses discovered in the repository.

1. **Remove hard-coded database password**
   - File: `docker-compose.prod.yml` line 10.
   - Move this password to an environment variable (`DB_PASSWORD`) and document it in `.env`.

2. **Fail startup if `SESSION_SECRET` is missing**
   - File: `server/routes.ts` line 68 uses a fallback secret value.
   - Modify the code so the server throws an error when `SESSION_SECRET` is undefined.

3. **Set secure session cookie options**
   - Add `sameSite: 'lax'` (or `strict`) to the session cookie configuration in `server/routes.ts` lines 71‑75.
   - Consider lowering the cookie lifetime if appropriate.

4. **Enable proper CSRF protection**
   - The `/api/csrf` endpoint currently returns a disabled token.
   - Integrate a library such as `csurf` and ensure state‑changing routes validate the CSRF token.

5. **Restrict CORS settings**
   - In `server/index.ts` lines 25‑31, the origin defaults to `'*'` with credentials allowed.
   - Require `CLIENT_URL` to be set and use that value only; otherwise refuse to start.

6. **Remove or secure debug endpoint `/api/test`**
   - File: `server/routes.ts` lines 160‑169 expose request headers and can leak information.
   - Either remove this route or protect it behind authentication in development only.

7. **Clean up sensitive logs and attachments**
   - Files under `attached_assets/` contain hashed passwords and debug output.
   - Move these files outside the repository and add an entry to `.gitignore` so logs are not committed.

8. **Run `npm audit fix` and update dependencies**
   - `npm audit` reports several vulnerabilities in packages such as `brace-expansion` and `cookie`.
   - Update dependencies and retest the application.
