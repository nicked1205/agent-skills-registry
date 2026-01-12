# Design Decisions & Justifications

This document records the architectural, security, API, and UX design decisions made during the development of the Agent Skills Registry.  
All decisions are documented with their rationale to make trade-offs explicit and the system easier to reason about and evolve.

---

## 1. Single-Page Application (SPA) Architecture

### Decision

- Frontend built as a React SPA
- Backend exposes a stateless REST API

### Justification

- Clear separation of concerns
- Token-based authentication fits naturally
- Easier to scale and reason about
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

#### 3. Allows safe logout patterns

- Even though the server does not explicitly revoke tokens
- Short expiry limits how long a logged-out token remains valid

JWTs are stateless in the sense that the server does not store session data, but they still include an expiration time to bound their validity.  
The `exp` claim allows the server to reject old or compromised tokens without maintaining server-side state.

### Client-side JWT expiry handling

Because authentication is stateless, the frontend monitors API responses and redirects users to the login screen when a token expires or becomes invalid. This preserves UX consistency without introducing server-side session state.

---

## 3. Enforcing Issuer and Audience in JWTs

### Decision

- Enable `ValidateIssuer` and `ValidateAudience`

### Justification

- Prevents token reuse across different services
- Clearly defines trust boundaries
- Production-grade security practice

---

## 4. JWT Claim Design (`Name` and `NameIdentifier`)

### Decision

Include both:

- `ClaimTypes.Name`
- `ClaimTypes.NameIdentifier`

### Rationale

- `ClaimTypes.Name` maps directly to `User.Identity.Name` and is appropriate for UI display and `/me` endpoints
- `ClaimTypes.NameIdentifier` represents a stable, system-level user ID
- Separating these avoids relying on usernames as identifiers
- Aligns with ASP.NET Core authentication conventions

Additional considerations:

- Usernames are user-facing and mutable
- Identifiers should be immutable and system-facing
- ASP.NET Core does not automatically map `sub` or `unique_name` to `User.Identity.Name`
- Using `ClaimTypes.Name` avoids custom claim mapping

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

`Rfc2898DeriveBytes` implements **PBKDF2**, a purpose-built password hashing algorithm designed to resist brute-force and dictionary attacks. It incorporates:

- **Per-user salts**, which prevent rainbow table attacks
- **Configurable iteration counts**, which deliberately slow down hash computation
- A design that is resilient to GPU and ASIC-based attacks compared to fast hashes

### Why PBKDF2 instead of SHA-256

Although SHA-256 is a cryptographically secure hash function, it is **not suitable for password storage**:

- SHA-256 is designed to be **fast**, which makes brute-force attacks cheaper and more scalable
- Fast hashes allow attackers to test millions or billions of guesses per second
- Salting alone does not solve this problem if the hash function is fast

PBKDF2, by contrast:

- Is intentionally **slow**
- Allows the computational cost to be increased over time
- Makes large-scale offline attacks significantly more expensive

Using `Rfc2898DeriveBytes` aligns with industry best practices for password storage and follows the security guidance recommended for .NET applications.

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

- `401 Unauthorized` — authentication failures
- `400 Bad Request` — invalid skill files
- `403 Forbidden` — authenticated but not owner
- `404 Not Found` — resource does not exist

### Justification

- Clear separation of concerns
- Improved debuggability
- Better UX and API clarity

---

## 9. Version-Control-Friendly Skill Storage

### Decision

- Skills are uploaded and stored as Markdown with structured frontmatter

### Justification

- Human-readable format
- Easy to version
- Diff-friendly
- Aligns with developer workflows

---

## 10. CORS Configuration

### Decision

- Explicitly allow requests only from the frontend origin

### Justification

- Prevents unauthorized cross-origin access
- Secure-by-default configuration

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

### Why not .NET 9 or preview releases

- Not LTS
- APIs change more frequently
- Higher dependency churn
- Less predictable in evaluation environments
- Reliability prioritized over novelty

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

Patch auto-upgrades were avoided to prioritize predictability. Upgrading later within .NET 8.x is straightforward once stability is confirmed.

---

## 12. DTO (Data Transfer Object) Usage

### Definition

A DTO is a simple object used to move data across application boundaries without exposing internal domain models.

### Rationale

- Controls what data leaves the API
- Prevents over-fetching
- Avoids coupling clients to EF Core entities
- Allows independent evolution of database schema and API contract

### Why DTOs were especially justified here

- Skill entity contains navigation properties and internal IDs
- Details view requires derived data (latest version content)
- API must enforce ownership and visibility rules
- Returning entities directly risks over-exposure

### Why DTOs were not used everywhere

- Simple list endpoints use lightweight projections
- DTOs introduced when payloads become richer, reusable, or tied to authorization and versioning

---

## 13. HTTP Method Choice for Visibility Changes

### Decision

- Use `PATCH` instead of `PUT`

### Justification

- Visibility toggling is a partial update
- Communicates intent more accurately
- Avoids full resource replacement semantics

---

## 14. Metadata Constraints

- Skill name capped at **100 characters**
- Description capped at **500 characters**

These limits ensure:

- Concise identifiers suitable for UI and search
- Descriptions remain summaries, not documentation
- Metadata remains lightweight and consistent

---

## 15. Tag Design

### Decisions

- Tags are owned by a skill
- No standalone `TagController`
- Tag endpoints are nested under skills

### Justification

- Tags have no meaning outside their parent skill
- Ownership and permission model remains explicit
- Simpler, safer API aligned with UI usage

### Constraints

- Maximum 5 tags per skill
- Maximum 16 characters per tag

These limits preserve readability and filtering quality in dense layouts.

---

## 16. ID Strategy

### Decision

- Deleted IDs are never reused

### Justification

- Prevents accidental reassociation
- Preserves referential integrity
- Avoids ambiguity in logs, caches, and audit history

---

## 17. Skill Cloning Semantics

### Decisions

- Cloned skills are private-only
- Only the latest version is cloned
- `clonedFromUsername` is stored for attribution

### Justification

- Prevents public feed spam
- Clones are independent by design
- Versions represent author history, not transferable state
- Attribution preserved without hard dependencies

---

## 18. Download Counting

### Decision

- Downloads are counted on the backend when the file is served

### Justification

- Reflects real downloads, not button clicks
- Avoids reliance on client-side behavior
- Keeps analytics accurate and extensible

### Content-Type Accuracy

The download endpoint explicitly sets `text/markdown; charset=utf-8` to ensure
correct decoding across browsers and editors.

---

## 19. Diff Viewer Behavior

### Decision

- Conservative word-level diff threshold (20%)
- Inline diffs only for small, localized changes
- Large edits treated as replacements

### Justification

- Avoids visual noise
- Prioritizes readability over maximal granularity
- Mirrors established tools such as GitHub

---

## 20. Pagination and Lazy Loading

### Decision

- Backend pagination
- Frontend lazy loading via incremental page requests

### Justification

- Predictable, bounded data access
- Improved perceived performance
- Scalable backend behavior

---

## 21. SQLite Date Handling

SQLite does not support ordering by `DateTimeOffset`, so:

- A normalized Unix timestamp is stored for ordering and pagination
- `DateTimeOffset` is retained for correct time semantics and display

This ensures stable pagination without relying on client-side ordering.

---

## 22. Responsive Layout Strategy

### Decision

- Disable row/table layout on low-width devices
- Force card layout on narrow viewports

### Rationale

- Row views are column-dependent and scan-optimized
- Narrow screens break table semantics
- Capability-based responsiveness ensures interaction patterns remain valid
- Prevents fragile layout hacks and misleading affordances

This mirrors how terminal tools adapt behavior based on available width.

---

## 23. API Call Classification

API calls are categorized into:

1. **Lifecycle / bootstrap calls** - page load (useEffect with cancelation handling)
2. **Reactive / derived calls** - state-dependent fetches (useEffect with dependency arrays)
3. **Event-driven calls** - direct user actions (handleSomeTask)

This separation improves reasoning, prevents stale data, and avoids duplicated requests.

---

## 24. Error Handling Philosophy

- Authentication failures are centralized
- Other errors are handled at the call site

This allows each API interaction to define its own error semantics and user-facing messaging while keeping auth handling consistent.

---

## 25. Token Expiry Trade-off

### Decision

- Access tokens expire after 2 hours

### Justification

- Low-risk productivity tool
- Reduces friction during longer editing sessions
- Refresh tokens intentionally deferred to keep the auth model simple

---

## 26. Application Entry Point

### Decision

- No standalone homepage

### Justification

- Authentication-first, utility-focused application
- Login page serves as the entry point
- Focus placed on clear onboarding rather than extra navigation layers
