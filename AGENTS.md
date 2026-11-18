# Jumpseat Raycast guidance

- This is a TypeScript Raycast extension using npm. Preserve compatibility with the Raycast APIs and the supported macOS and Windows command surfaces; the menu bar command remains macOS-only.
- Preserve the fixed Jumpseat API and web origins, OAuth/PKCE behavior, token storage, and the scopes (`flights:upcoming:read` on the released flow; `flights:upcoming:read flights:past:read` on central OAuth) unless a coordinated compatibility change is approved.
- A user may view their own private booking details. Never request or display friends' booking details, and never expose tokens or credentials in UI, logs, or errors.
- Run `npm test`, `npm run lint`, and `npm run build` for affected code changes. Fix failures introduced by the requested change; docs-only changes need lightweight validation.
- Do not run `npm run publish`, submit to the Raycast Store, or change live OAuth configuration unless the user explicitly requests that external action.
- Before finishing, inspect the diff, run `git diff --check`, and report verification performed and remaining risk.

## Other Jumpseat repositories

Jumpseat spans five repositories, checked out side by side (`../<name>`):

- `jumpseat-mobile`: the native iOS and Android apps and their shared Kotlin logic (`sharedLogic`, governed by `Contracts`). iOS is the source of truth for product behavior and visual design.
- `jumpseat-mono`: the Fastify backend (REST/OpenAPI for the apps, tRPC for the admin) and the Next.js admin app. The backend is authoritative for canonical flight state, entitlements, and quotas.
- `jumpseat-web`: the public Next.js website. It covers only part of the app and re-implements some of its flight rules against the vendored mobile `Contracts`.
- `jumpseat-mcp`: the MCP server behind the ChatGPT app and other MCP clients.
- `jumpseat-raycast` (this repository): the Raycast extension.

When a change alters logic, an API contract, copy, or visual design that another repository also implements or consumes, check that repository's matching code and keep it up to date: make the matching change there in the same piece of work, on its own branch or worktree from its default branch and following its own `AGENTS.md`, or, when you cannot, report exactly what it still needs. Only update what a repository already has; do not bring features it lacks over to it. Where a repository deliberately departs from iOS, say so. Backend API changes stay additive so released clients keep working (see `jumpseat-mono`'s `AGENTS.md`).
