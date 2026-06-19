---
applyTo: "frontend/**"
---

## Frontend — React + TypeScript + Vite + RTK Query

**Components:** Functional components only. Typed Redux hooks: `useAppSelector` / `useAppDispatch`.

**Data fetching:** RTK Query for all server data — never use raw `fetch()`. Base URL from `VITE_API_BASE_URL` env var (`frontend/src/api/baseApi.ts`). 401 auto-refresh logic lives in that file — do not duplicate it.

**RTK Query mutation pattern:** For mutations that update list or detail caches, use `onQueryStarted` + `updateQueryData` for optimistic updates (see any existing `*Api.ts` for the pattern). Use `providesTags` / `invalidatesTags` only where optimistic update is not feasible.

**Cache tags:** Reuse existing tag types for cache invalidation. Do not invent new tag strings.

**Store layout:** Redux store (`frontend/src/store/`) has two slices — `authSlice` (auth state) and `apiErrorSlice` (API error queue). Surface API errors via `addApiError` from `store/apiErrorSlice`; the `ApiErrorNotification` component handles display. Do not create custom error UI.

**Type sync with backend:** When backend models or API schemas change, update the corresponding TypeScript interfaces and RTK Query endpoint definitions in `frontend/src/` to match. Keep request/response types in sync — no stale field names or missing fields.

**Styling:** Tailwind CSS only. Respect OS light/dark mode — no custom theme toggle unless explicitly requested. Fully responsive from iPhone 12 portrait to 4K landscape; cap content width on wide screens.

**Icons:** Always use `lucide-react`. Never write inline SVG or hardcode `<path>` elements.
