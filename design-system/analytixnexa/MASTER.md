# AnalytixNexa — Design System (Master)

Source of truth for the UI. Generated with the `ui-ux-pro-max` design
intelligence skill and implemented in MUI v5 + Emotion.

- **Style**: Glass Premium — derived from *Modern Dark (Cinema Mobile)*
  (frosted glass, ambient aurora, no pure black) adapted for a web dashboard.
- **Palette**: *Analytics Dashboard* (light mode) + *night indigo / dream
  violet* (dark mode).
- **Dials**: variance 6/10 (balanced-modern) · motion 5/10 (standard) ·
  density 8/10 (dense dashboard).
- **Default mode**: dark. Both modes are fully supported and persisted to the
  user's Firestore profile.

## Where the tokens live

| Layer | File | Contains |
|---|---|---|
| 1 — primitives | `src/theme/tokens.js` → `primitives` | raw colour ramps |
| 2 — semantic | `src/theme/tokens.js` → `semantic[mode]` | roles per mode |
| 3 — recipes | `src/theme/tokens.js` → `glass()`, `gradients`, `motion`, `radii` | reusable surface/motion recipes |
| MUI bridge | `src/theme/theme.jsx` | palette, typography, component overrides |

**Rule: never write a hex value in a component.** Read from
`theme.palette.*`, `theme.palette.glass.*`, `theme.gradients.*`,
`theme.motion.*`, or call `theme.glass({ elevated, hover })`.

## Colour

| Role | Dark | Light |
|---|---|---|
| Ground (deepest) | `#05060B` | `#EEF2FA` |
| Page background | `#080A12` | `#F5F7FC` |
| Glass surface | `rgba(16,21,36,.56)` | `rgba(255,255,255,.72)` |
| Glass surface (elevated) | `rgba(19,25,42,.74)` | `rgba(255,255,255,.88)` |
| Input well | `rgba(7,9,17,.55)` | `rgba(255,255,255,.88)` |
| Border hairline | `rgba(255,255,255,.09)` | `rgba(15,23,42,.09)` |
| Primary | `#5B7CFA` | `#4460E8` |
| Accent / secondary | `#7C5CFF` | `#6A44F0` |
| Success / Warning / Error / Info | `#34D399` / `#FBBF24` / `#FB7185` / `#3FD5E8` | `#16A34A` / `#D97706` / `#DC2626` / `#22BFD4` |
| Text primary / secondary / faint | `#EDEFF7` / `#98A1B8` / `#6B7590` | `#0F172A` / `#5A6480` / `#7C87A1` |

Brand gradient: `linear-gradient(135deg, #5B7CFA, #7C5CFF)` — used for primary
buttons, the logo tile, active nav indicators and clipped headline text.

### Two rules that matter most in dark mode
1. **Glass carries its own ink base.** A translucent *white* wash over a bright
   aurora reads as milky grey. Surfaces are dark-tinted; the specular highlight
   is layered on top as a corner-anchored radial gradient of fixed pixel size
   (a percentage-sized highlight washes across wide tables).
2. **Inputs go darker than their panel, not lighter.** A lighter field reads as
   a raised button; a darker one reads as a well you can type into.

## Typography

- UI: **Inter** (300–800).
- Metrics and any tabular figure: **JetBrains Mono** with
  `font-variant-numeric: tabular-nums`, so numbers never reflow as they tick.
- Display sizes are fluid `clamp()` with tight tracking (−0.02 to −0.035em).
- `variant="metric"` is the custom Typography variant for KPI numbers;
  `variant="subtitle2"` is the uppercase eyebrow label.

## Shape, spacing, motion

- Radii: 8 / 12 (controls) / 16 (cards) / 22 (dialogs) / 999 (pills).
- Spacing step: 8px (density 8/10 — dense dashboard rhythm).
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) everywhere.
- Durations: 160ms micro · 240ms standard · 320ms entrance.
- Entrance: staggered `rise-in` (opacity + 14px translate), 70ms per item.
- Press feedback: `scale(0.975)` on buttons, `scale(0.94)` on icon buttons.
- All animation is gated behind `prefers-reduced-motion: reduce`.

## Component vocabulary (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `AuroraBackground` | app-shell ground: gradient + 3 drifting blobs + masked grid |
| `GlassCard` | the workhorse surface; `spotlight`, `interactive`, `elevated`, `accent`, `delay` |
| `StatCard` | KPI tile: eyebrow, mono metric, caption, tinted icon medallion |
| `AnimatedNumber` | expo-out count-up; announces the final value to screen readers |
| `GradientText` | headline with the brand gradient clipped to the glyphs |
| `PageHeader` | page masthead: eyebrow, gradient title, subtitle, action slot |
| `EmptyState` | first-class empty screen — always offers the next action |
| `GlassDialog` | titled glass modal; `dismissible={false}` while a task is in flight |
| `TaskStateDialog` | one dialog for running / succeeded / failed long tasks |
| `LoadingScreen` | branded conic-ring loader with reserved height (no CLS) |
| `StatusDot` | pulsing presence dot — always paired with a text label |
| `BrandMark` | logo lockup; `compact` for the collapsed rail |

Shared feature components: `AuthShell`, `ResultPanel`, `UploadPanel`,
`chartTheme.js`.

## Charts

Chart.js styling is centralised in `src/components/chartTheme.js`
(`baseOptions(theme, { title, horizontal, legend })`).

- Bars carry a vertical brand gradient, 6px radius, 42px max thickness.
- Ranked categories are **sorted descending** — ranking is the insight.
- Single-series charts hide the legend (it only repeats the title).
- Axis grid is a theme hairline; no chart borders.
- Secondary values (e.g. unit price) go in the tooltip, not a second axis.

## Non-negotiables

- Contrast ≥ 4.5:1 for body text (verified: 7:1+ on the auth screens).
- Every interactive target ≥ 44×44 — enforced in the theme for `IconButton`,
  `Checkbox` and inline `Link` buttons, so it cannot regress per-component.
- `:focus-visible` always shows a 2px primary ring; never removed.
- Errors use `role="alert"`; long tasks use `role="status"` + `aria-live`.
- Icons are SVG (MUI Rounded set) — never emoji.
- No horizontal scroll at 320 / 375 / 768 / 1024 / 1440px (verified).
- No pure `#000` background (OLED smear and halation).
