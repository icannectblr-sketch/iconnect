# iConnect BLR storefront plan

## Product scope
A responsive storefront for iConnect BLR, a Bengaluru mobile business serving RT Nagar and Yeshwanthpur with buy, sell, exchange and repair services. Public research references the Instagram handle **@iconnect.blr**, the Yeshwanthpur RTO Road branch, and the RT Nagar 80 Feet Road location. The only intentionally simulated step is payment.

- React/Vite marketplace storefront with dedicated `/shop`, `/sell`, `/repair`, `/login`, `/signup`, and `/admin` flows using the existing web-db-user starter and `framer-motion`.
- Real Manus OAuth login handoff through the starter's `startLogin` helper.
- UI state for product browsing, search/filter, cart, sell-device intake, repair booking, account access, admin overview, and a clearly labelled demo checkout.
- Product and service content is kept in typed frontend data so the site is useful immediately and can later be moved behind database procedures without changing the interaction model.
- Marketplace home uses a search-first header, category strip, limited-time deals rail, sortable catalogue, product detail drawer, wishlist state, cart drawer, and checkout transition.
- Use supplied managed storage assets for hero, shop, repair, and product imagery.
- Mobile hero remains intentionally static and clean; the supplied video is presented separately in the home-page story section.
- Home includes corrected trust messaging: genuine/checked mobiles, checking guarantee, warranty support, exchange offers, affordable pricing, beat-price guarantee, and a muted YouTube story section using the supplied video.
- Branch admin entry shows the approved RT Nagar (`rtnagar@gmail.com`) and Yeshwanthpur (`yesh@gmail.com`) Manus identities without storing their passwords in client code.
- Keep the app mobile-first and keyboard accessible with native forms, labels, focusable controls, and live success states.

## Design system
- **Design movement:** Editorial case-study commerce inspired by the supplied reference: quiet canvas, oversized typography, thin rules, status-led content, and restrained motion.
- **Core principles:** one clear message per block, energetic but accessible contrast, fast scanning, and human service warmth.
- **Color philosophy:** UI/UX Pro Max vibrant retail palette: emerald `#059669` anchors trust and freshness, mint `#10B981` adds energy, orange `#EA580C` marks urgency and primary actions, blue/violet/amber category tiles support rapid scanning, and forest `#064E3B` preserves readable contrast.
- **Layout paradigm:** Editorial marketplace shell with a compact search header, colorful category navigation, structured product rails, service cross-sell bands, branch discovery, and a light/dark presentation toggle. Mobile removes the hero block and prioritizes categories, deals, and bottom navigation.
- **Signature elements:** oversized black display type, one-pixel section rules, grayscale device imagery, status numbers, and small orange/green utility accents.
- **Interaction philosophy:** every CTA starts a concrete task, product cards expose details before checkout, search/filter/sort update the catalogue immediately, and forms use visible labels with clear success states. Mobile uses a simple iPhone-style glass bottom bar for Home, Shop, Sell, Repair, and More.
- **Animation:** Framer Motion handles header and navigation reveal, staggered hero copy entrance, hero image scale-in, side-card lift, in-view product reveals, drawer spring transitions, saved-state feedback, and toast feedback; CSS provides hover polish and reduced-motion support.
- **Typography:** Outfit for display and product hierarchy with Work Sans for readable UI copy and IBM Plex Mono for operational labels.
- **Brand essence:** Bengaluru's practical, trusted place to upgrade, repair, or move on your phone. Personality: candid, sharp, dependable.
- **Voice:** direct, friendly, local. Example lines: “Your next phone is closer than you think.” / “Bring the old one. Leave with a better one.”
- **Wordmark:** compact lower-case wordmark with a signal dot/plug mark.
- **Signature colors:** emerald `#059669`, orange `#EA580C`, mint `#B9F6C0`.

## Structure
- `client/src/App.tsx`: storefront composition, typed catalog, dedicated page flows, cart, forms, auth CTA, and admin overview.
- `client/src/index.css`: design tokens, responsive layout, component styling, and motion.
- `client/public/manus-routes.json`: public route declaration.
- `public`/managed storage: product and service imagery.

## Complete build workflow
Run diagnostics, start the configured dev server, verify `/api/health` and `/manus-routes.json`, run `pnpm check` and `pnpm build`, then commit and push the intended checkpoint to the canonical `main` branch. Keep payment copy explicitly demo-only until a future payment integration is requested.
