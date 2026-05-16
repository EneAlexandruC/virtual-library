Virtual Library — scaffolded Next.js app

Quick start:
1. Copy .env.example to .env and set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET
2. npm install
3. npm run setup-admin   # creates admin from .env
4. npm run dev

Admin UI: /admin
Public catalogue: /
Public PDF reader: /books/[id]
Admin dashboard: /admin/dashboard

Security: Set a strong ADMIN_SECRET and ADMIN_PASSWORD before running in production.

PDF uploads:
- Admins add a title, author, and PDF from the dashboard.
- Visitors read PDFs inside the site through the book reader page.