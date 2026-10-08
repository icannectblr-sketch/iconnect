# iConnect BLR

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

## Admin product management

The `/admin` workspace accepts email/password accounts with `users.role = 'admin'`. Create the account through `/signup`, then grant admin access from a trusted database session:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Admin sign-in is role-checked on the server. Product listings are stored in the database and published to the public catalogue. Product image uploads use the configured Manus storage service, and AI descriptions use the configured LLM service. Copy `.env.example` to `.env` and set `DATABASE_URL`, `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_API_URL`, and `MANUS_API_KEY` in the server environment for these features. Never commit the filled `.env` file.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.
