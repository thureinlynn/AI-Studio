# Firebase Authentication & Community Firestore Integration

Implement real user authentication with Firebase Auth (`getAuth`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`) and link community baggage listings in Firestore to user UIDs with owner-level modification controls.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1:
> 1. **Public Browsing with Protected Posting**: Visitors can openly discover and browse available traveler baggage space on the community board; posting a new trip or managing trip status requires real authentication.
> 2. **Shared Community Trips with Owner Controls**: All users can view community trips, while editing, status toggling, and deletion are restricted to the owner matching `trip.userId === auth.currentUser.uid`.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the authentication layer from local demo profiles to real Firebase Authentication backed by your Firebase project (`luukyone-b17b7`). Users can register with email and password, log in securely across sessions, and have their profile (name, bio, direct contact channels) saved to Firestore.
- **Data Association**: Every trip created in Firestore is tagged with the authenticated traveler's `userId` (`user.uid`). Community members can browse all active trips, while only the trip owner has access to update status or delete their listing.
- **Target Audience**: Myanmar and international peer-to-peer travelers and senders who need a trustworthy, authenticated community for extra baggage sharing.

---

## 2. User Experience & Visual Design

- **Clean Authentication UI (`AuthModal.tsx`)**:
  - Two dedicated tabs: **Sign In** and **Create Account**.
  - **Sign In Tab**: Email address and password with clear inline error messaging for Firebase Auth errors (e.g., `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password`).
  - **Create Account Tab**: Full traveler profile creation (Full Name, Email, Password, Bio, plus direct contacts for WhatsApp, Telegram, Facebook, and Viber).
  - Modern, dark-mode ready design with smooth transitions and visual focus rings.
- **Protected Actions & Seamless Prompts**:
  - Clicking **"Post a Trip"** when logged out opens the Auth modal with a contextual prompt ("Log in to post your luggage allowance").
  - Upon successful authentication, the user is immediately transitioned to the trip posting modal or profile view.
- **Owner-Exclusive Actions**:
  - On the Trip Detail page and Trip Cards, management controls (Mark as Fully Booked / Active, Delete Trip) are only rendered when `currentUser.uid === trip.userId`.
  - Senders can see traveler contact buttons (WhatsApp, Telegram, Facebook, Viber) and verified badges.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firebase Auth vs Custom Server Auth**
  - *Chosen Approach*: Direct client-side Firebase Auth (`getAuth`) integrated via `src/firebase.ts`.
  - *Why*: Secure, industry-standard authentication managed by Google Cloud/Firebase, eliminating server password storage risks and seamlessly pairing with Firestore security rules.
- **Decision 2: Profile Persistence in Firestore**
  - *Chosen Approach*: On user registration or update, profile information is synchronized to the `users/{uid}` document in Firestore.
  - *Why*: Ensures verified profile data (bio, contact handles, display name) persists across devices and re-logins.
- **Decision 3: Global Community Board with Owner Authorization**
  - *Chosen Approach*: All trips are stored in the root `trips` collection, tagged with `userId`.
  - *Why*: Maximizes marketplace liquidity so any sender can discover trips, while preventing non-owners from tampering with or deleting listings.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   React Client App                     │
├──────────────────────────┬─────────────────────────────┤
│   AuthContext            │       TripContext           │
│   - onAuthStateChanged   │       - onSnapshot('trips') │
│   - signInWithEmail      │       - addNewTrip(uid)     │
│   - createUserWithEmail  │       - deleteTrip(owner)   │
│   - signOut              │       - toggleStatus(owner) │
└─────────────┬────────────┴───────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Firebase Authentication  │  │   Firebase Firestore     │
│ - getAuth(app)           │  │ - 'trips' collection     │
│ - email/password tokens  │  │   (tagged with userId)   │
│ - persistent session     │  │ - 'users' collection     │
│                          │  │   (user profile docs)    │
└──────────────────────────┘  └──────────────────────────┘
```

### Data Schema

1. **User Profile (`users/{uid}`)**:
   - `uid`: string (Firebase Auth UID)
   - `name`: string
   - `email`: string
   - `bio`: string
   - `contacts`: `{ whatsapp, telegram, facebook, viber }`
   - `createdAt`: ISO timestamp string
   - `isVerified`: boolean

2. **Trip (`trips/{tripId}`)**:
   - `id`: string
   - `userId`: string (matches creator's `auth.currentUser.uid`)
   - `departureCity`, `departureCountry`: string
   - `arrivalCity`, `arrivalCountry`: string
   - `weightAvailableKg`: number
   - `lastDropOffDate`: string (YYYY-MM-DD)
   - `checkOutDate`: string (YYYY-MM-DD)
   - `status`: `'active' | 'fully_booked' | 'completed'`
   - `traveler`: `{ name, avatarUrl, bio, isVerified }`
   - `contacts`: `{ whatsapp, telegram, facebook, viber }`
   - `announcement`: string

### Implementation Steps

1. **Update `src/firebase.ts`**:
   - Import `getAuth` from `firebase/auth`.
   - Initialize and export `auth = getAuth(app)`.
2. **Refactor `src/context/AuthContext.tsx`**:
   - Wire `onAuthStateChanged(auth, ...)` to maintain real Firebase auth state.
   - Implement `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, and `signOut`.
   - Store and fetch user profiles from Firestore collection `'users'`.
3. **Upgrade `src/components/AuthModal.tsx`**:
   - Build a clean email/password Sign In and Sign Up form with validation, loading states, and user-friendly error codes.
4. **Enforce Ownership in `TripContext.tsx` & `TripDetail.tsx`**:
   - Ensure `addNewTrip` attaches the authenticated user's `uid`.
   - Only allow deletion and status toggles when `currentUser?.id === trip.userId`.
5. **Validation & Dev Server Refresh**:
   - Run `compile_applet` and `lint_applet` to ensure zero compilation and typing errors.
