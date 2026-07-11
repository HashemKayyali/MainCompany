# 08 — I18N CONSTITUTION

## Banned outright (Deletion Ledger DEL-02/03)
DOM-wide MutationObserver translation; global text-node rewriting; global heuristic direction mutation (`applyNaturalTextDirections` as a document walker). Any PR reintroducing document-level text/dir mutation fails review.

## Architecture (ADR-03)
- next-intl, App Router integration; `localePrefix: 'as-needed'` → English keeps every indexed URL unchanged; Arabic at `/ar/*`.
- Locale resolution order: URL → `NEXT_LOCALE` cookie → `Accept-Language` → `en`. Middleware negotiates; language switcher navigates to the alternate URL and sets the cookie.
- Typed message keys; messages split per domain (`messages/{en,ar}/{common,catalog,forms,auth,account,chat,admin}.json`); CI key-coverage check (converted from the legacy `audit-*-i18n.mjs` scripts) — missing keys block (QG-I18N-1).
- Extraction: the legacy phrase dictionary (`src/lib/i18n.ts`) is the *source corpus* for a scripted EN-phrase→key conversion (I18N-004/005), then deleted.

## Entity content (database-resident Arabic)
- `*_ar` columns (nullable, fallback EN) on: products (name, short/long description, specs where text), categories (name, description), custom builds (+categories), gallery album titles, legal docs if DB-resident. Admin forms gain AR fields (P2 additive migration files only — never run directly, repo rule).
- The regex composition rules (`i18n.ts:2049+`) are retired by this move; SEO consequence: Arabic pages contain real crawlable Arabic.
- User-generated content (chat, request notes): never machine-translated; rendered inside `<Bidi>`.

## Direction & typography
- `<html lang dir>` per locale from the server; zero client flash.
- Logical CSS only: `ms/me/ps/pe/text-start/border-s` — sweep task (I18N-012) + ESLint rule banning `left|right` paddings/margins in new code where a logical twin exists.
- `<Bidi auto>` component (scoped reincarnation of the natural-direction heuristic) used ONLY where mixed content occurs: product names in AR pages, chat bubbles, user inputs (`dir="auto"` on inputs/textareas).
- Icons/gestures: direction-sensitive icons (arrows, send) flip via a `[dir=rtl]` utility or `rtl:` Tailwind variants; carousel/lightbox swipe direction derives from locale context; RTL gesture E2E is blocking (QG-RTL).
- Arabic typography: Alexandria/IBM Plex Sans Arabic stack retained; line-height/heading-size checks on the 6 template visual snapshots (AR set).

## Metadata & URLs
- hreflang pairs + `x-default` on every localized route; `og:locale` + `og:locale:alternate`; canonical per locale variant.
- Sitemap alternates (`xhtml:link`) added post-P2 (SEO-009).
- OAuth locale preservation: the sanitized redirect carries the locale-prefixed path; callback lands on `/ar/...` naturally (AUTH-014).
