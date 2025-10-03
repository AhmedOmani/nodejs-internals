Omix: A Tiny HTTP Web Framework (Educational Project)

This repository is a personal learning exercise. I wanted to understand how a simple Node.js HTTP framework could work under the hood: routing, middleware, requests/responses, and serving static files. There is also a small demo app (Poster-Project) that uses a Postgres database to share sessions across two servers.

What this project is (and isn’t)

- It’s a hands-on exploration of the building blocks of a web framework.
- It’s not production-ready, and it doesn’t try to compete with Express, Fastify, etc.
- It focuses on clarity over features. Most choices are made to keep the code approachable.

Folders at a glance

- Omix-Framework/: the framework itself
  - Omix.js: wraps Node’s http server, runs global middleware, then routes the request
  - Omix-Router.js: a simple router built on a Trie (see below)
  - Omix-Request.js: minimal request helper (headers, body parsing)
  - Omix-Response.js: minimal response helper (status, headers, send, json, sendFile)
- Poster-Project/: a small demo app using the framework
  - server-1.js and server-2.js: two app instances
  - middleware/: global logger, static file server, and auth middleware
  - db.js: Postgres pool and table initializers (sessions, users, posts)
  - public/: static assets served by the static middleware

Router design: using a Trie

The routing system is implemented with a Trie (prefix tree). Each path segment is a node. For example, for /users/:id/posts the segments are ["users", ":id", "posts"]. The Trie lets me:

- Match static segments quickly
- Support a single dynamic segment per level (e.g. :id)
- Extract params during traversal (e.g. params.id)

A route stores, per HTTP method, its final handler and any per-route middleware. At request time, the router walks the Trie, optionally binds params when it encounters a dynamic segment, and returns the matched handlers. This keeps matching predictable and easy to reason about.

Middleware flow (simple and explicit)

- Global middleware (e.g. static files, logging) runs first, in order.
- If nothing ends the response, control falls back to the router match.
- The matched route’s middleware runs, then the route handler.
- Errors thrown in middleware/handlers are caught at a single place and turned into a 500 if the response hasn’t already been sent.

Request/Response helpers

- OmixRequest.body(): collects the body and parses JSON when Content-Type includes application/json.
- OmixResponse: small helpers for status(), setHeader(), send(), json(), sendFile().

The demo app (why two servers?)

The Poster-Project runs two app instances to illustrate session sharing and basic CRUD:

- Sessions are stored in Postgres (sessions table) so both servers accept the same cookie token.
- Users and posts are also stored in Postgres. Login checks the users table; the posts API joins users to include the author.
- Global middleware shows how static files and logging plug into the framework.
- A tiny load balancer (`Poster-Project/proxy.js`) forwards requests to the two servers using a simple round‑robin selection. This is just to demonstrate splitting traffic; it’s intentionally minimal.

Why this exists

I built this to practice:

- Implementing a router on top of a Trie and understanding its trade‑offs
- Chaining middleware explicitly without external dependencies
- Building bare‑bones request/response helpers
- Wiring a minimal demo that uses a real database for sessions and data

Notes

- Security, validation, and error handling are intentionally minimal. This is a learning tool.
- The database credentials are expected via environment variables (see Poster-Project/db.js). The demo seeds some users and posts for convenience.

If you’re reading the code, I hope it’s clear, and helpful for learning. That’s the whole goal.


