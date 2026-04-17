# Netlify Deployment

This project is prepared for Netlify static hosting plus Netlify Functions.

## Why this setup

- GitHub Pages cannot run the Node backend.
- Netlify can host the static portfolio and run serverless API routes.
- Local SQLite is not a reliable deployed database, so production uses Supabase.

## 1. Create the Supabase table

Run the SQL in [supabase-schema.sql](C:\Users\deepa\OneDrive\Documents\New project\supabase-schema.sql) in your Supabase SQL editor.

## 2. Add these Netlify environment variables

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_MESSAGES_TABLE`

Recommended value for `SUPABASE_MESSAGES_TABLE`:

```text
messages
```

## 3. Deploy to Netlify

1. Push this project to GitHub.
2. In Netlify, choose `Add new site` -> `Import from Git`.
3. Select this repository.
4. Netlify should detect [netlify.toml](C:\Users\deepa\OneDrive\Documents\New project\netlify.toml) automatically.
5. Set the environment variables above in Site Configuration -> Environment Variables.
6. Deploy.

## 4. What works after deploy

- `/` serves the portfolio
- `/api/contact` saves messages to Supabase
- `/login.html` signs into admin
- `/admin.html` loads messages from the protected API

## Notes

- The existing [server.js](C:\Users\deepa\OneDrive\Documents\New project\server.js) is still useful for local development.
- Production on Netlify uses the files in [netlify](C:\Users\deepa\OneDrive\Documents\New project\netlify).
