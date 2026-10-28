# Equationist API

The API uses native JavaScript ES modules (`import`/`export`) with explicit `.js` extensions for local imports.

## Setup

1. Start MySQL and run the project-root `database.sql` once. It creates the `equationist` database, tables, and the initial 30-question bank.
2. Copy `.env.example` to `.env` and set the MySQL credentials plus a random `JWT_SECRET` of at least 32 characters.
3. From this directory, run `npm install` if needed and then `npm run dev` (or `npm start`). The API listens on port 4000 by default.
4. Start the frontend with `npm run dev` in `Equationist-web`. Vite proxies `/api` requests to the API.

To make an account an administrator, sign up normally, then promote it from MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Registration always creates a regular user. Administrators can then grant or remove administrator roles in the in-app account manager.

## Endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API and database readiness |
| POST | `/api/auth/signup` | Public | Create a user account with a bcrypt password hash |
| POST | `/api/auth/login` | Public | Verify credentials and issue a JWT |
| GET | `/api/auth/me` | Signed in | Return the current account |
| GET | `/api/questions/counts` | Public | Count active questions by difficulty |
| GET | `/api/questions?difficulty=easy&mode=practice` | Public | Fetch active questions (answers are included only for builder mode) |
| POST | `/api/questions/:id/check` | Signed in | Check an answer on the server without returning stored answers |
| GET/POST | `/api/sessions` | Signed in | Read session history and save a completed round |
| GET | `/api/sessions/dashboard` | Signed in | Return player statistics and recent rounds |
| GET/POST | `/api/questions/admin` | Admin | List all questions or add one |
| PATCH/DELETE | `/api/questions/admin/:id` | Admin | Update or delete a question |
| GET | `/api/admin/users` | Admin | List accounts and round totals |
| PATCH | `/api/admin/users/:id` | Admin | Change role and active/suspended status |
| GET | `/api/admin/overview` | Admin | Platform totals |

Send protected requests with `Authorization: Bearer <token>`. The API reads the user's current role and status from MySQL on authenticated requests, so role changes and suspensions take effect without waiting for the token to expire.
