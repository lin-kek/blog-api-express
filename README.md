# Blog API - Express + TypeScript + Prisma + JWT + Multer + Sharp

Blog backend built with **Express** and **TypeScript**. It exposes public post endpoints, an admin area protected by **JWT**, and cover image uploads via **Multer** with **Sharp** (static files served from `public/`). Data layer uses **Prisma** with **PostgreSQL**. Request payloads are validated with **Zod**.

## Stack

- Express and TypeScript
- Prisma (PostgreSQL)
- JWT for authentication
- Multer + Sharp for image uploads and processing
- Zod for request validation

## Endpoints (essentials)

**Public**

- `GET /api/posts?page=<n>` - list _published_ posts (default pagination: 5 per page).
- `GET /api/posts/:slug` - post details.
- `GET /api/posts/:slug/related?page=<n>` - related posts by tags.

**Admin (JWT Bearer)**

- `GET /api/admin/posts?page=<n>` - list all posts.
- `GET /api/admin/posts/:slug` - post details.
- `POST /api/admin/posts` - create post (multipart/form-data: one `cover` file + `title`, `body`, `tags`).
- `PATCH /api/admin/posts/:slug` - edit post (any subset of fields and optional new `cover`).
- `DELETE /api/admin/posts/:slug` - delete post.

> Header: `Authorization: Bearer <token>`

## Quickstart

```bash
# 1) Clone
git clone <REPO_URL>
cd <REPO_FOLDER>

# 2) Environment
# open .env and fill the variables described in the section below

# 3) Install dependencies and set up Prisma
npm install
npx prisma generate
npx prisma migrate dev

# 4) Run in development
npm run dev
# the server serves ./public/ and listens on port 3000 by default
```

## Environment variables

- `DATABASE_URL` - PostgreSQL connection string used by Prisma.
- `JWT_KEY` - strong secret used to sign and verify JWT access tokens.
- `BASE_URL` - public base URL that serves `./public/`.

## CORS

- **Dev:** Open by default (`cors()`), which makes it easy to test from `http://localhost:<your-frontend-port>` if needed.
- **Production:** Restrict allowed origins by editing `src/libs/cors.ts` (add your domain(s) to `allowedOrigins`).
- CORS is enforced by browsers only, tools like Postman/cURL ignore it. Tweak it as you please.

## Notes

- Upload accepts **JPEG/JPG/PNG** and automatically converts it to .webp, then stores it under `public/images/covers/`.
- Pagination is controlled by `?page=<n>` with default 1, and 5 items per page.

## License

Licensed under the MIT License. See `LICENSE` for details.
