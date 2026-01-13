# Design Decisions & Justifications

This document records the architectural, security, API, and UX design decisions made during the development of agent-skills-registry.  
All decisions are documented with their rationale to make trade-offs clear and the system easier to reason and evolve.

---

## 1. Single-Page Application (SPA) Architecture

### Decision

- Frontend built as a React SPA
- Backend exposes a stateless REST API

### Justification

- Required in the brief
- Clear sepaeration of concerns
- Token-based authentication fits naturally
- Easier to scale and reason
- Industry-standard for modern web applications

---

## 2. JWT-Based Authentication

### Decision

- Use JWTs for authentication instead of session cookies

### Justification

- Stateless authentication
- Works cleanly with SPAs
- Scales well across services
- No server-side session storage required

### Why expiration is essential (even in stateless auth)

#### 1. Limits damage if a token is stolen

- Without expiry: a leaked token works forever
- With expiry: the token becomes useless after a fixed window

#### 2. Enforces re-authentication

- Users must log in again periodically
- Credentials can be revalidated
- Permissions can change over time

#### 3. Token-expiration detection

- Automatically detect authorization error in api calls
- Redirects to login

#### 4. Strategy for URL pasting and Backpaging

- Protected component wrapper prevents access to a page not having a valid token

#### 5. Planning for the future

- Token expires way quicker
- Minimizes damage if token is stolen
- `/refresh` endpoint to refresh token for user without having to reauthenticate

JWTs are stateless in the sense that the server does not store session data, but they still include an expiration time to bound their validity.

---

## 3. Enforcing Issuer and Audience in JWTs

### Decision

- Enable `ValidateIssuer` and `ValidateAudience`

### Justification

- Prevents token reuse across different services
- Confirms that the token comes from a trusted source (issuer) and is meant for a specific service (audience)

---

## 4. JWT Claim Design (`Name` and `NameIdentifier`)

### Decision

Include both:

- `ClaimTypes.Name`
- `ClaimTypes.NameIdentifier`

### Rationale

- `ClaimTypes.Name` maps directly to `User.Identity.Name` and is appropriate for frontend and `/me` endpoints
- `ClaimTypes.NameIdentifier` represents a stable, backend user ID
- Separating these avoids relying on usernames as identifiers
- Aligns with ASP.NET Core authentication conventions

---

## 5. Avoiding Direct `Microsoft.IdentityModel.*` Dependencies

### Decision

- Rely solely on `Microsoft.AspNetCore.Authentication.JwtBearer`
- Do not manually install IdentityModel packages

### Justification

- Prevents runtime version mismatches
- Avoids cryptic JWT parsing errors
- Allows ASP.NET Core to manage compatible dependency versions

---

## 6. Password Hashing Strategy

### Decision

- Passwords are hashed before storage
- No plaintext passwords are ever stored
- Password hashing uses `Rfc2898DeriveBytes` (PBKDF2)

### Justification

Storing passwords securely is a fundamental security requirement. Even in the event of a database compromise, password hashes should be computationally expensive to reverse.

`Rfc2898DeriveBytes` implements PBKDF2, a password hashing algorithm designed to resist brute-force and dictionary attacks, with:

- Per-user salts, which prevent rainbow table attacks
- Configurable iteration counts, slowing down hash computation
- A design that is resilient to GPU and ASIC-based attacks compared to fast hashes

### Why PBKDF2 instead of SHA-256

Although SHA-256 is a cryptographically secure hash function, it is not suitable for password storage:

- SHA-256 is fast, which makes brute-force attacks cheaper and more scalable
- Fast hashes allow attackers to test millions or billions of guesses per second
- Salting alone does not solve this problem if the hash function is fast

PBKDF2, by contrast:

- Is slow
- Allows the computational cost to be increased over time
- Makes large-scale offline attacks significantly more expensive

Using `Rfc2898DeriveBytes` aligns with industry best practices for password storage and is usually recommended for .NET applications.

---

## 7. Strict Markdown Frontmatter Validation

### Decision

- Require `name` and `description` in frontmatter
- Reject uploads that do not meet the schema

### Justification

- Ensures consistent metadata
- Prevents partially indexed skills
- Enables reliable search, tagging, and display
- Fail-fast validation improves correctness

---

## 8. Fail-Fast Error Handling

### Decision

Return explicit HTTP status codes:

- `401 Unauthorized` - authentication failures
- `400 Bad Request` - invalid skill files
- `403 Forbidden` - authenticated but not owner
- `404 Not Found` - resource does not exist

### Justification

- Clear separation of errors
- Improved debug efficiency
- Better UX and API clarity

---

## 9. Version-Control-Friendly Skill Storage

### Decision

- Skills are uploaded and stored as Markdown with structured frontmatter

### Justification

- Human-readable format
- Easy to version
- Easy to diff

---

## 10. CORS(Cross-Origin Resource Sharing) Configuration

### Decision

- Explicitly allow requests only from the frontend origin

### Justification

- Allow web applications from different origins to request and share resources, bypassing the browser's default security restriction (Same-Origin Policy)
- Prevents unauthorized cross-origin access to APIs or data
  -> Control who is doing what to data and APIs

---

## 11. Backend Framework Choice: .NET 8 (LTS)

### Decision

- Backend targets .NET 8 (Long-Term Support)

### Justification

- Stability guarantees
- Security updates
- Tooling consistency
- Suitable for backend services and maintained projects
- Avoids breaking changes from preview or STS releases
- Easily updatable if needed

### Why not .NET 9 or preview releases

- Not LTS
- APIs change more frequently
- Higher dependency churn
- Less predictable in building a product as a challenge situation
- Reliability prioritized

### Dependency pinning to 8.0.4

#### Decision

- Backend dependencies pinned to version 8.0.4

#### Justification

- Ensures reproducible builds
- Identical behavior across machines
- Avoids subtle runtime mismatches
- Especially important for:
  - JWT authentication
  - Security-sensitive middleware
  - EF Core migrations

Patch auto-upgrades were avoided to prioritize predictability. Upgrading later is straightforward once stability (LTS) is confirmed.

---

## 12. DTO (Data Transfer Object) Usage

### Definition

A DTO is a simple object used to move data across application boundaries without exposing internal domain models.

### Rationale

- Controls what data leaves the API
- Prevents over-fetching
- Avoids exposing EF Core entities info to client
- Allows independent evolution of database schema and API contract

---

## 13. HTTP Method Choice for Visibility Changes

### Decision

- Use `PATCH` instead of `PUT`

### Justification

- Visibility toggling is a partial update
- Communicates partial intent more accurately
- Avoids full resource replacement semantics

---

## 14. Metadata Constraints

- Skill name capped at 100 characters
- Description capped at 500 characters

These limits ensure:

- Concise identifiers suitable for UI and search
- Descriptions remain summaries, not documentation
- Metadata remains lightweight and consistent
- Prevents infinitely long skill name or description in database -> performance and logical issue

These constraints can be modified easily in both frontend and backend.

---

## 15. Tag Design

### Backend

- Tags are owned by a skill
- No standalone `TagController`
- Tag endpoints are nested under skills
- Client-side code api call functions are still separated by tag and skill for clarity

### Frontend

- Tag displays are horizontally scrollable
- No scrollbar but with fade effects to signify scrollability

### Justification

- Tags have no meaning outside their parent skill
- Ownership and permission model remains explicit
- Simpler, safer API aligned with UI usage
- Supports however much tags are allowed per skill
- Aesthetically-pleasing fade effect > layout-breaking horizontal scrollbar

### Constraints

- Maximum 20 tags per skill (more than sufficient to support organization and filtering)
- Maximum 16 characters per tag

These constraints preserve readability, and logically aligns with tag-filtering, and can be modified easily on client's request in both frontend and backend.

---

## 16. ID Strategy

### Decision

- Deleted IDs are never reused

### Justification

- Prevents accidental reassociation (new pointer pointing to deleted entries situations)
- Preserves referential integrity
- Avoids confusion in logs, caches, and audit history

---

## 17. Skill Cloning Procedure

### Decisions

- Cloned skills are private-only
- Only the latest version is cloned
- `clonedFromUsername` is stored for attribution

### Justification

- Prevents public feed spam
- Clones are seen as a new fork by design
- Versions represent author history, not transferable state
- Clarify owenership

---

## 18. Download Counting

### Decision

- Downloads are counted on the backend when the file is served
- Downloads only counted when another user download your skill and vice versa

### Justification

- Reflects real downloads, not button clicks
- Avoids reliance on client-side behavior
- Keeps analytics accurate and evolvable
- Downloads can be seen as user's file popularity

### Content-Type Accuracy

The download endpoint explicitly sets `text/markdown; charset=utf-8` to ensure
correct decoding across browsers and editors.

---

## 19. Diff Viewer Behavior

### Decision

- Conservative word-level diff threshold (20%)
- Inline diffs only for small changes
- Large edits treated as replacements

### Justification

- Avoids visual noise
- Prioritizes readability over maximal granularity
- Mirrors famous tools such as GitHub

---

## 20. Pagination and Lazy Loading

### Decision

- Backend pagination
- Frontend lazy loading via incremental page requests

### Justification

- Predictable, bounded data access
- Improve performance in the future (1M+ public skill entries)
- Can easily convert to pagination
- Constants can be modified easily (amount per page)
- Pagesize limit at the API level reduces the risk of denial-of-service attacks caused by large or repeated data requests

---

## 21. SQLite Date Handling

SQLite does not support ordering by `DateTimeOffset`, so:

- A normalized Unix timestamp is stored for ordering and pagination
- `DateTimeOffset` is retained for correct time display

This ensure to delegates ordering to backend, not frontend

---

## 22. Responsive Layout Strategy

### Decision

- Disable row/table toggle and force card layout on low-width devices

### Rationale

- Row views are only suitable for wide screen to have enough space for enough data to be shown
- Capability-based responsiveness ensure UX
- Prevents fragile layout hacks and misleading affordances

---

## 23. API Call Classification

API calls are categorized into:

1. Lifecycle / bootstrap calls - page load (useEffect with cancelation handling)
2. Reactive / derived calls - state-dependent fetches (useEffect with dependency arrays)
3. Event-driven calls - direct user actions (handleSomeTask)

This separation improves reasoning, prevents stale data, and avoids duplicated requests.

---

## 24. Error Handling Philosophy

- Errors are handled at api call site
  -> Allows each API interaction to define its own error params, easing error displays.

---

## 25. Token Expiry Trade-off

### Decision

- Access tokens expire after 2 hours

### Justification

- Product is a low-risk productivity tool
- Reduces reauthentication during longer editing sessions
- Refresh tokens are planned to be implemented in the future

---

## 26. Application Entry Point

### Decision

- No standalone homepage

### Justification

- Authentication-first, utility-focused application
- Login page serves as the entry point
- Focus placed on clear onboarding rather than extra navigation layers

---

## 27. Input Validation

### Decision

- All input validation (username, tagname, password,...) are done in both frontend and backend
- The frontend enforces constraints for immediate user feedback and UI stability
- The backend independently enforces the same constraints as the authoritative gatekeeper

### Justification

- Ensures unified input structure
- Frontend checks can be bypassed through non-UI access paths
- This layered approach reduces the risk of malformed or unsafe input entering the system

## 28. Row-style layout

### Decision

- Fields with variable-length content, such as version identifiers, are allocated a fixed ch units rather than percentage-based or content-sized widths
- Elastic metadata regions, such as tags, consume remaining horizontal space using flex with overflow handling.

### Justification

- Prevents visual wiggly column effect when values vary in length (e.g., v3 vs v10000)
- Balances flexibility with aesthetic

## 29. Handling Pathological Long Strings

### Decision

- Preserve natural word boundaries for normal text
- Treat extremely long, unbroken strings as pathological input
- Apply overflow-wrap: anywhere only in contexts where wrapping is acceptable
- Use truncation in contexts where wrapping would harm layout
- Truncating username in the middle

### Justification

- Breaking normal words degrades readability and scan-ability across the UI
- Truncation preserve layout stability
- Preserves username prefix and suffix meanings

## 30. Frontmatter Parsing Scope

### Decision

- Ignores ill-formatted or unrelated frontmatter lines
- Supports a restricted frontmatter format consisting of single-line key:value pairs and does not implement full YAML features such as multiline values, block scalars, or nested structures

### Justification

- The challenge specification and provided examples only require simple metadata fields (name, description, allowed-tools) expressed on single lines
- A constrained parser avoids ambiguous parsing behavior not clarified or requested by the client (the brief)
- Limiting supported syntax improves robustness and security by minimizing the accepted input surface
- Ensures deterministic parsing and predictable validation errors

If richer metadata becomes necessary, the parser can be extended or replaced with a corresponding YAML parser without breaking existing files, as the current format is just a simpler YAML parser
