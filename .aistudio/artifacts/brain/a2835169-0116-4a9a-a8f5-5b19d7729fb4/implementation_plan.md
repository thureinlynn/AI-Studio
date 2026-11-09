# User Profile Trip History Pagination

Add clean, responsive 10-item pagination with numbered page navigation and Previous/Next controls to the traveler profile trip history in `PublicProfileModal.tsx`.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications were confirmed through the interactive design review:
> - **Navigation Style**: Numbered pagination buttons (`1`, `2`, `3`...) accompanied by "Previous" and "Next" controls.
> - **List Ordering**: Unified trip timeline presenting active trips first (open for drop-off), followed by past/completed trips, sliced at 10 items per page.

---

## 1. Overview & Core Concept

- **What It Does**: Limits the rendered trip history in the traveler profile modal to 10 trips per page, reducing modal vertical scroll bloat and providing quick jump navigation across multiple pages for frequent carriers.
- **Target Audience**: Community senders browsing a traveler's past routes, completion track record, and upcoming active departures.
- **Key Value**: Crisp, legible profile presentation with instantaneous page transitions and zero layout disruption.

```
┌─────────────────────────────────────────────────────────────┐
│ Traveler Profile (Modal)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Identity Card (Name, Member Since, Trips Completed)     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Trip History (Total: 24 Trips · Page 1 of 3)                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Trip 1 (Active) - Bangkok ➔ Yangon                     │ │
│ │ Trip 2 (Active) - Singapore ➔ Tokyo                     │ │
│ │ ...                                                     │ │
│ │ Trip 10 (Past)  - London ➔ New York                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [ < Prev ]   [ 1 ]  ( 2 )  [ 3 ]   [ Next > ]               │
│ Showing 1-10 of 24 trips                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. User Experience & Visual Design

1. **Ordering & Slicing**:
   - `unifiedTrips = [...activeTrips, ...pastOrBookedTrips]`
   - Slices precisely 10 items per page: `unifiedTrips.slice((currentPage - 1) * 10, currentPage * 10)`.

2. **Pagination Controls**:
   - Centered flex row with subtle surface styling matching the dark/light mode palette.
   - **Previous / Next Buttons**: Single-line text buttons with directional icons (`ChevronLeft`, `ChevronRight`), disabled with `opacity-40 cursor-not-allowed` on boundary pages.
   - **Page Numbers**: Compact, touch-friendly rounded square buttons (`w-7 h-7 sm:w-8 sm:h-8`).
   - **Active State**: Highlighted with `bg-blue-600 text-white font-bold` in light/dark mode.
   - **Inactive State**: Subtle hover states (`hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300`).
   - **Metadata Footer**: Quiet text indicating `Showing X–Y of Z trips` with tabular numbers.

3. **State Reset & Safety**:
   - Automatically resets `currentPage` to `1` when opening a different traveler's profile or switching profiles.
   - Hides pagination controls if total items $\le 10$.

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side Slicing vs Server Querying**:
  - *Chosen Approach*: In-memory slicing from the already synchronized Firestore trip collection.
  - *Why*: Instantaneous zero-latency pagination transitions with no extra Firebase read charges, ensuring fluid navigation.
- **Active-First Grouping**:
  - *Chosen Approach*: Active upcoming trips appear at the top of Page 1 where senders need them most, while older completed trips naturally populate subsequent pages.

---

## 4. Technical Architecture & Component Mapping

```
TripContext (trips, publicProfileTraveler)
       │
       ▼
PublicProfileModal.tsx
  ├─ travelerTrips = filter matching traveler
  ├─ activeTrips = status === 'active' && !isDropOffDatePassed
  ├─ pastOrBookedTrips = isDropOffDatePassed || status !== 'active'
  ├─ unifiedTrips = [...activeTrips, ...pastOrBookedTrips]
  ├─ currentPage (default: 1)
  ├─ paginatedSlice = unifiedTrips.slice((page-1)*10, page*10)
  └─ PaginationControls (Numbered buttons, Prev/Next, Page range summary)
```

### Proposed Changes:
1. **`src/components/PublicProfileModal.tsx`**:
   - Add `currentPage` state (default `1`).
   - Add `useEffect` resetting `currentPage` to `1` when `publicProfileTraveler.name` or `publicProfileTraveler.userId` changes.
   - Combine `activeTrips` and `pastOrBookedTrips` into `unifiedTrips`.
   - Slice current 10 items for rendering.
   - Render clean pagination bar with Prev, Page Numbers, Next, and count summary when `totalPages > 1`.
2. **Verification**:
   - Compile applet with `compile_applet` and `lint_applet` to ensure zero errors.
   - Verify dark and light mode styling.
