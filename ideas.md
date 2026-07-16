# Joseph Mews Investor Platform - Design Ideas

## Chosen Direction: "Private Banking Modernism"

**Design Movement:** Editorial-meets-Fintech, drawing from the visual language of premium private banking apps (Coutts, JP Morgan Private Bank) crossed with editorial publication design (The Gentlewoman, Monocle).

**Core Principles:**
1. **Quiet Confidence** — Information speaks louder than decoration. No persuasion needed.
2. **Editorial Hierarchy** — Serif display typography for headlines paired with clean sans-serif for data.
3. **Atmospheric Darkness** — Deep charcoal (#0F0F0F) with subtle warmth, not pure black.
4. **Champagne Restraint** — Muted gold (#C6A46C) used as a punctuation mark, not a highlight.

**Color Philosophy:**
- Background: `#0F0F0F` (warm charcoal — feels like a leather-bound ledger)
- Surface: `#161616` to `#1C1C1C` (subtle elevation through warmth, not lines)
- Champagne Gold: `#C6A46C` (key numbers, dividers, micro-interactions only)
- Foreground: `#F5F1E8` (warm off-white, never pure white)
- Muted: `#8A8276` (warm grey for secondary labels)

**Typography System:**
- Display: **Fraunces** (variable serif — used for hero numbers, page titles, property names)
- Body: **Inter** (clean sans — UI labels, body copy, buttons)
- Monospace: **JetBrains Mono** (for dates, document IDs, timestamps)

**Layout Paradigm:**
- Mobile-first, single-column scrolling
- Generous vertical rhythm (32-64px between sections)
- Hairline dividers (1px, 8% opacity gold) instead of cards where possible
- Asymmetric data presentation: large hero number, small label

**Signature Elements:**
1. Thin gold hairline dividers between sections
2. Mixed serif/sans typography for data ("£1,250,000" in serif, "PROPERTY VALUE" in sans uppercase)
3. Subtle grain texture on surfaces (1-2% noise overlay)

**Interaction Philosophy:**
- Slow, considered transitions (300-500ms ease-out)
- Tap states: subtle gold glow, no aggressive feedback
- Page transitions: gentle fade + 8px slide
- Numbers: subtle count-up animations on entry

**Animation:**
- Entrance: fade + slight upward translate (8-12px) staggered by 80ms
- Interactions: scale 0.98 on tap, gold border-bottom on focus
- Charts: line draws over 1.2s with ease-out
- Timestamps: pulse subtly when "live" (recent updates)
