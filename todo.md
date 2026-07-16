# Mobile Optimisation

## Audit
- [ ] Inspect AppShell, Dashboard, Portfolio, PropertyDetail, Documents, Login on mobile width
- [ ] Identify desktop-only paddings, oversized type, fixed-width grids

## Refactor
- [ ] Lock app to phone-width frame on desktop, true-edge on mobile
- [ ] Tune typography scales for ≤375px
- [ ] Tighten section paddings + horizontal gutters for mobile
- [ ] Stack any 2-col grids that get cramped on mobile
- [ ] Ensure tap targets ≥44px (TimeRangeTabs, nav, cards)
- [ ] Charts: reduce height on mobile, hide x-axis labels on narrow ranges
- [ ] Ensure top safe-area + bottom-nav safe-area padding (iOS notch / home bar)
- [ ] Sticky bottom nav + sticky header tuned for mobile

## Polish
- [ ] Active/pressed states on cards (touch-friendly)
- [ ] Disable hover-only effects on touch devices
- [ ] Verify no horizontal overflow on any screen
- [ ] Test long-name property cards don't break layout

## Verify
- [ ] Inspect each screen at 375px and 414px
- [ ] Save checkpoint
