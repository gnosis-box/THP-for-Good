# IMPL-A-07 Open Graph Metadata Plan (Execution-Ready)

## Goal
Add complete share metadata for home and expert profile pages so links preview correctly on chat/social, while keeping root layout metadata as safe fallback.

## Current Baseline (Confirmed)
- Working branch: `impl/a-07-og-metadata`.
- IMPL-A-06 home hero is already integrated in this branch (cherry-picked):
  - `c29eb2a` feat(home): add conversion-first landing hero above expert grid
  - `ae6bf71` chore(home): remove wallet host note from landing hero
- IMPL-A-07 copy/metadata must align with this new home hero baseline.
- Review strategy is grouped in one stream (no standalone IMPL-A-06 PR).

## Scope
- Add `generateMetadata` to home and expert detail routes.
- Keep fallback metadata in [`app/layout.tsx`](/home/mestryx/WorkSpace/repositories/THP-for-Good/app/layout.tsx).
- Use absolute URLs for `openGraph.url` and image fields via `NEXT_PUBLIC_APP_URL`.
- Add/confirm a default static OG image path.
- Preserve `notFound()` behavior on invalid/missing expert IDs.

## Files to Change
- [`app/layout.tsx`](/home/mestryx/WorkSpace/repositories/THP-for-Good/app/layout.tsx)
- [`app/page.tsx`](/home/mestryx/WorkSpace/repositories/THP-for-Good/app/page.tsx)
- [`app/expert/[id]/page.tsx`](/home/mestryx/WorkSpace/repositories/THP-for-Good/app/expert/[id]/page.tsx)
- [`.env.example`](/home/mestryx/WorkSpace/repositories/THP-for-Good/.env.example)
- Optional only if needed: [`lib/ui-copy.ts`](/home/mestryx/WorkSpace/repositories/THP-for-Good/lib/ui-copy.ts)

## Implementation Steps
1. **Layout metadata foundation**
   - Add `metadataBase` in `app/layout.tsx` using normalized `NEXT_PUBLIC_APP_URL`.
   - Keep root fallback title/description.
   - Add root fallback `openGraph` + `twitter` structure with default image path.

2. **Home route metadata**
   - Add `generateMetadata` in `app/page.tsx`.
   - Reuse hero-aligned positioning copy.
   - Set canonical/OG URL to `/` and include default image.

3. **Expert route dynamic metadata**
   - Add `generateMetadata` in `app/expert/[id]/page.tsx`.
   - Build dynamic title from expert name.
   - Build description from bio excerpt + skills summary.
   - For invalid/missing IDs, keep existing 404 behavior (`notFound()` path remains authoritative).

4. **Default OG image and env docs**
   - Confirm static OG image path used by all route metadata.
   - Add `NEXT_PUBLIC_APP_URL` documentation to `.env.example` (if absent), with clear format example.

5. **Verification**
   - Run `pnpm build`.
   - Validate metadata for:
     - `/`
     - `/expert/{validId}`
     - `/expert/{invalidId}` (404)

## Verification Checklist
- `pnpm build` passes.
- Home has title/description + OG/Twitter tags with absolute URLs.
- Expert page has dynamic title/description for valid expert.
- Invalid expert route remains 404 and does not expose expert-specific metadata.
- `.env.example` documents `NEXT_PUBLIC_APP_URL`.

## Delivery Notes
- Keep all work on `impl/a-07-og-metadata`.
- In final PR summary, explicitly state:
  - IMPL-A-06 base was integrated first.
  - IMPL-A-07 metadata builds on that baseline.
