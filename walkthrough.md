# Security Summary

**Reviewed Files**: 28
**Issues Resolved**: 11

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| Unauthenticated User Data Dump & Account Spoofing | `server.ts` / `api/users.ts` | 208, 255 / 43, 58 | `GET /api/users` returned all stored user profiles (including emails), and `POST /api/users` / `login` trusted client-supplied IDs and emails without authentication. | High | Fixed | Added Firebase ID token signature verification (`verifyFirebaseIdToken`), restricted `GET /api/users` to the caller's own profile, and bound user creation/login IDs and emails to the verified token. |
| Missing Auth & Ownership Checks on Trip Mutations | `server.ts` / `api/trips.ts` | 107, 136, 172 / 51, 86, 106 | Any anonymous caller could create spoofed trips (`userId`), change any trip's status, or delete another traveler's trip. | High | Fixed | Enforced Firebase Bearer token authentication on `POST`, `PATCH`, and `DELETE`, forced `userId` from the verified token, forced `isVerified: false`, and verified `isTripOwner` before updates or deletes. |
| Name-Based Owner UI Spoofing | `src/components/TripDetail.tsx` | 67 | Edit/delete owner controls matched by display name (`user.name === travelerName`) in addition to user ID, allowing another account with the same name to access owner actions in the UI. | Medium | Fixed | Restricted `isOwner` strictly to matching `user.id === trip.userId`. |
| Unescaped JSON-LD Script Injection | `src/components/SEO.tsx` / `src/utils/seoUtils.ts` | 93 / 15 | Structured JSON-LD used raw `JSON.stringify` inside `dangerouslySetInnerHTML`, which could allow `</script>` sequences in trip text to break out of the script tag. | High | Fixed | Removed `dangerouslySetInnerHTML`, switched to writing `scriptTag.textContent`, and added `safeJsonLdStringify` to escape `<`, `>`, `&`, and line separators (plus `escapeXml` for `sitemap.xml`). |
| Unsafe Contact & Avatar URL Handling | `src/utils/tripUtils.ts` / `src/utils/userUtils.ts` | 58, 69 / 88, 116 | Facebook/Telegram contact links accepted arbitrary external domains or unsafe characters, `PublicProfileModal` rendered unescaped contact links, and `isAuthenticPhotoUrl` accepted `data:image/svg+xml` URIs. | Medium | Fixed | Restricted Facebook links to official Meta domains, sanitized Telegram handles and phone numbers, allowed only raster `data:image/(png\|jpeg\|jpg\|webp\|gif)` and verified HTTPS avatar URLs, and applied `sanitizeExternalHttpUrl` and `rel="noopener noreferrer"` across contact cards. |
| Unsandboxed Third-Party Ad Iframe | `src/components/AdsterraAdCard.tsx` | 100 | The feed banner ad iframe ran without a `sandbox` attribute, giving third-party ad scripts broader browser capabilities than needed. | Medium | Fixed | Added `sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"` (excluding `allow-same-origin`) and `referrerPolicy="no-referrer"`. |
| Wildcard CORS, Missing Security Headers & Unbounded Payloads | `server.ts` / `vercel.json` / `server/security.ts` | 38, 48, 59 / 46 / 378 | API routes allowed `Access-Control-Allow-Origin: *`, lacked security response headers, had no rate limiting or JSON body size cap, and leaked `err.message` in `api/*.ts` 500 responses. | Medium | Fixed | Replaced `*` with a strict origin allowlist, added `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`, capped JSON bodies to 32KB, added IP rate limiting, and returned generic server error messages. |
| Missing Local Firestore Rules File | `firestore.rules` | 1 | No `firestore.rules` existed in the repository for the external Firebase project `luukyone-b17b7`, leaving database access reliant solely on console settings. | High | Needs Follow-Up | Authored least-privilege rules in `firestore.rules` (owner-only `users/{userId}`, public read / owner-only validated write `trips/{tripId}`). Deploy `firestore.rules` to project `luukyone-b17b7` in the Firebase Console. |
| Browser Firebase Key Domain Scoping & App Check | `src/firebase.ts` | 21 | The client Firebase `apiKey` (normal for web SDK apps) is visible in frontend code and needs Google Cloud HTTP referrer limits and Firebase App Check enforcement against quota abuse. | Low | Needs Follow-Up | Restrict the Web API key in Google Cloud Console (`Credentials` -> HTTP referrers for `luukyone.astronerd.me/*`) and enable Firebase App Check (reCAPTCHA Enterprise) in Firebase Console. |
| Transitive Dev & SDK Dependency Advisories | `package.json` / `bun.lock` | 1 | `bun audit` reported 4 advisories in transitive packages (`@grpc/grpc-js` inside `firebase` SDK; `glob` and `minimatch` inside dev-only `vite-plugin-pwa`). | Low | Needs Follow-Up | Not directly exposed in browser bundles or Express routes; monitor for upstream `firebase` and `vite-plugin-pwa` releases and upgrade when available. |
| Missing Server Payload Bounds in Trip Form | `src/components/PostTripModal.tsx` | 1 | Form inputs had no client-side `maxLength` guards matching server limits. | Low | Fixed | Added `maxLength` attributes to location notes (`500`), announcement (`2000`), and contact handles, enforced server-side in `sanitizeTripInput`. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| Session & Token Verification | `server/security.ts` | Verifies Firebase RS256 ID token signatures against Google's public X.509 certificates, checking issuer, audience (`luukyone-b17b7`), expiration, and `sub` UID. |
| API Input & Ownership Guardrails | `server.ts`, `api/trips.ts`, `api/users.ts` | Enforces 32KB payload limits, sliding-window IP rate limits, field length/type validation, and strict `userId === authUser.uid` ownership checks. |
| Safe DOM & Metadata Rendering | `src/components/SEO.tsx`, `src/utils/seoUtils.ts` | Eliminates `dangerouslySetInnerHTML` and escapes HTML/script delimiters (`\u003c`, `\u003e`, `\u0026`) in JSON-LD and XML special characters in `sitemap.xml`. |
| Safe External Links & Media | `src/utils/tripUtils.ts`, `src/utils/userUtils.ts`, `src/components/PublicProfileModal.tsx` | Blocks `javascript:`, `data:text/html`, `data:image/svg+xml`, and non-Facebook phishing URLs; applies `rel="noopener noreferrer"` on external targets. |
| Third-Party Script Isolation | `src/components/AdsterraAdCard.tsx` | Runs banner ads in a sandboxed iframe without `allow-same-origin` so third-party scripts cannot access parent DOM, cookies, or `localStorage`. |
| Deployment Security Headers | `vercel.json`, `server.ts` | Sends `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` without blocking iframe previews. |

---

## PoC Verification

### 1. Unauthenticated User Enumeration & Cross-User Trip Deletion
#### Summary
| Field | Value |
|---|---|
| Issue Type | Missing Authentication & Ownership Check |
| Impact | High |
| Affected File | `server.ts:172-230`, `api/trips.ts:51-112`, `api/users.ts:38-52` |
| Test Scenario | `GET /api/users` and `DELETE /api/trips/trip-123` sent without a valid Firebase Bearer token or signed by a different user (`uid-attacker`). |

#### How It Was Fixed
Added `verifyFirebaseIdToken` in `server/security.ts` to validate Firebase RS256 ID tokens against Google's public certificates, restricted `/api/users` to the caller's own UID, and verified `isTripOwner(existing, authUser.uid)` before updating or deleting any trip.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Unauthenticated `GET /api/users` or `DELETE /api/trips/trip-123` arrives at `server.ts` / `api/trips.ts`. | Request enters route handler |
| 2 | Handler calls `verifyFirebaseIdToken(req.headers.authorization)` at `server.ts:213` and `server.ts:177`. | Returns `null` -> responds `401 Authentication required` |
| 3 | Attacker sends a valid token for `uid-attacker` targeting `uid-victim`'s trip. `isTripOwner(existing, authUser.uid)` runs at `server.ts:192`. | Evaluates `false` -> responds `403 Forbidden` |

#### Conclusion
**Fix Verified** - Neither anonymous callers nor authenticated third parties can read another user's profile or modify/delete another traveler's trip.

---

### 2. JSON-LD Script Breakout via Malicious Trip Announcement
#### Summary
| Field | Value |
|---|---|
| Issue Type | Unsanitized Script Injection |
| Impact | High |
| Affected File | `src/components/SEO.tsx:93`, `src/utils/seoUtils.ts:15` |
| Test Scenario | A trip announcement containing `</script><script>alert(1)</script>` rendered in `TripDetail`. |

#### How It Was Fixed
Replaced `dangerouslySetInnerHTML` in `SEO.tsx` with `scriptTag.textContent` and passed all structured data through `safeJsonLdStringify`, which encodes `<`, `>`, `&`, `\u2028`, and `\u2029`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Trip description enters `generateTripJsonLd(trip)` in `src/utils/seoUtils.ts:93`. | Payload string enters JSON-LD object |
| 2 | `SEO.tsx:93` serializes the object with `safeJsonLdStringify(jsonLd)`. | Replaces `</script>` with `\u003c/script\u003e` |
| 3 | Browser DOM assigns result via `scriptTag.textContent` instead of HTML parsing. | **Handled Safely** |

#### Conclusion
**Fix Verified** - Embedded script-closing tags are escaped and assigned safely as text content, preventing script execution.

---

### 3. Phishing URL & Unsafe Scheme Injection in Contact & Avatar Fields
#### Summary
| Field | Value |
|---|---|
| Issue Type | Unsafe Redirect / Malicious URI Scheme |
| Impact | Medium |
| Affected File | `src/utils/tripUtils.ts:16,69`, `src/utils/userUtils.ts:88,116` |
| Test Scenario | `https://evil-phishing.example.com/login` submitted as a Facebook contact, or `data:image/svg+xml;base64,...` / `javascript:alert(1)` submitted as `avatarUrl`. |

#### How It Was Fixed
`formatFacebookUrl` enforces an explicit allowlist of Facebook hostnames (`facebook.com`, `fb.com`, `fb.me`), `sanitizeExternalHttpUrl` allows only `http:`/`https:`, and `isAuthenticPhotoUrl` / `normalizeAvatarUrl` reject SVG data URIs and `javascript:` schemes in favor of deterministic Dicebear avatars.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | `https://evil-phishing.example.com/login` enters `formatFacebookUrl()` at `src/utils/tripUtils.ts:69`. | URL host is checked against `ALLOWED_FACEBOOK_HOSTS` |
| 2 | Hostname check fails at `src/utils/tripUtils.ts:80`. | Returns `''` (button not rendered) |
| 3 | `javascript:alert(1)` enters `normalizeAvatarUrl()` at `src/utils/userUtils.ts:116`. | Fails `isAuthenticPhotoUrl` and HTTP(S) check -> returns `getDicebearAvatar(seed)` |

#### Conclusion
**Fix Verified** - Malicious links and SVG/script avatar URIs are stripped or replaced before rendering.

---

### 4. Same-Name Traveler Impersonation for Owner UI Controls
#### Summary
| Field | Value |
|---|---|
| Issue Type | Broken Ownership Check |
| Impact | Medium |
| Affected File | `src/components/TripDetail.tsx:67` |
| Test Scenario | User B sets their display name to `"Alex Thant"` and views a trip posted by User A (`userId: "uid-alex"`). |

#### How It Was Fixed
Removed the display-name comparison from `isOwner` in `TripDetail.tsx` so ownership checks strictly compare immutable user IDs (`Boolean(user && trip.userId && user.id === trip.userId)`).

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | User B opens User A's trip in `TripDetail.tsx`. | `isOwner` check executes at line 67 |
| 2 | `user.id === trip.userId` compares User B's UID against User A's `trip.userId`. | Evaluates to `false` |
| 3 | Owner controls ("Mark Fully Booked" / "Delete Listing") remain hidden, and backend `PATCH`/`DELETE` also enforce `isTripOwner`. | **Handled Safely** |

#### Conclusion
**Fix Verified** - Display-name collisions can no longer expose owner controls in the interface.
