/**
 * AnalytixNexa — Design Tokens
 * Style: "Glass Premium" (Modern Dark / frosted glass, ambient aurora)
 * Source: ui-ux-pro-max design system — style "Modern Dark (Cinema Mobile)",
 * palette "Analytics Dashboard" (light) + "Sleep Tracker / night indigo" (dark).
 * Density dial 8/10 (dense dashboard), Motion dial 5/10 (standard), Variance 6/10.
 *
 * Layer 1 = primitives, Layer 2 = semantic, Layer 3 = recipes (glass/shadow/motion).
 * Never hardcode a hex in a component — pull it from here or from the MUI theme.
 */

/* ── Layer 1: primitives ─────────────────────────────────────────────── */

export const primitives = {
  indigo: {
    50: "#EEF1FE",
    100: "#DCE3FD",
    200: "#B9C7FB",
    300: "#93A8F8",
    400: "#6E89F5",
    500: "#5B7CFA",
    600: "#4460E8",
    700: "#3449C4",
    800: "#2A3A9C",
    900: "#222E75",
  },
  violet: {
    400: "#9B7CFF",
    500: "#7C5CFF",
    600: "#6A44F0",
  },
  cyan: { 400: "#3FD5E8", 500: "#22BFD4" },
  emerald: { 400: "#34D399", 500: "#22C55E", 600: "#16A34A" },
  amber: { 400: "#FBBF24", 500: "#F59E0B", 600: "#D97706" },
  rose: { 400: "#FB7185", 500: "#EF4444", 600: "#DC2626" },
  ink: {
    /* dark-mode ground — never pure #000 (OLED smear + halation) */
    950: "#05060B",
    900: "#080A12",
    850: "#0B0E18",
    800: "#0E1220",
    700: "#151A2C",
    600: "#1D2438",
  },
  slate: {
    50: "#F7F9FD",
    100: "#EEF2F9",
    200: "#DFE5F0",
    300: "#C3CCDD",
    400: "#8B93A7",
    500: "#5A6480",
    600: "#3E4760",
    700: "#2A324A",
  },
  white: "#FFFFFF",
};

/* ── Layer 2: semantic, per mode ─────────────────────────────────────── */

export const semantic = {
  dark: {
    bgDeep: primitives.ink[950],
    bgBase: primitives.ink[900],
    bgElevated: primitives.ink[800],
    /* dark-tinted glass: a white wash over a bright aurora reads as milky
       grey, so the surface carries its own ink base and the highlight is
       layered on top as a gradient (see `glass()` below) */
    surface: "rgba(16, 21, 36, 0.56)",
    surfaceStrong: "rgba(19, 25, 42, 0.74)",
    surfaceHover: "rgba(25, 32, 52, 0.68)",
    inputBg: "rgba(7, 9, 17, 0.55)",
    border: "rgba(255, 255, 255, 0.09)",
    borderStrong: "rgba(255, 255, 255, 0.16)",
    sheen: "rgba(255, 255, 255, 0.22)",
    primary: primitives.indigo[500],
    primaryHover: primitives.indigo[400],
    onPrimary: "#FFFFFF",
    accent: primitives.violet[500],
    success: primitives.emerald[400],
    warning: primitives.amber[400],
    danger: primitives.rose[400],
    info: primitives.cyan[400],
    text: "#EDEFF7",
    textMuted: "#98A1B8",
    textFaint: "#6B7590",
    /* ambient aurora blobs painted behind the app shell */
    aurora: [
      "rgba(91, 124, 250, 0.20)",
      "rgba(124, 92, 255, 0.15)",
      "rgba(34, 191, 212, 0.10)",
    ],
    grid: "rgba(255, 255, 255, 0.035)",
  },
  light: {
    bgDeep: "#EEF2FA",
    bgBase: "#F5F7FC",
    bgElevated: "#FFFFFF",
    surface: "rgba(255, 255, 255, 0.72)",
    surfaceStrong: "rgba(255, 255, 255, 0.88)",
    surfaceHover: "rgba(255, 255, 255, 0.96)",
    inputBg: "rgba(255, 255, 255, 0.88)",
    border: "rgba(15, 23, 42, 0.09)",
    borderStrong: "rgba(15, 23, 42, 0.16)",
    sheen: "rgba(255, 255, 255, 0.9)",
    primary: primitives.indigo[600],
    primaryHover: primitives.indigo[700],
    onPrimary: "#FFFFFF",
    accent: primitives.violet[600],
    success: primitives.emerald[600],
    warning: primitives.amber[600],
    danger: primitives.rose[600],
    info: primitives.cyan[500],
    text: "#0F172A",
    textMuted: primitives.slate[500],
    textFaint: "#7C87A1",
    aurora: [
      "rgba(91, 124, 250, 0.22)",
      "rgba(124, 92, 255, 0.16)",
      "rgba(34, 191, 212, 0.14)",
    ],
    grid: "rgba(15, 23, 42, 0.035)",
  },
};

/* ── Layer 3: recipes ────────────────────────────────────────────────── */

export const radii = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

/* density 8/10 → 8px base step, tight rhythm for data-dense surfaces */
export const space = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 };

export const motion = {
  /* Expo-out — the signature easing of the resolved style */
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  fast: 160,
  base: 240,
  slow: 320,
};

export const typography = {
  sans: '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  /* tabular figures for metrics — data should never shift width as it ticks */
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
};

export const gradients = {
  brand: `linear-gradient(135deg, ${primitives.indigo[500]} 0%, ${primitives.violet[500]} 100%)`,
  brandHover: `linear-gradient(135deg, ${primitives.indigo[400]} 0%, ${primitives.violet[400]} 100%)`,
  brandSoft: `linear-gradient(135deg, rgba(91,124,250,0.16) 0%, rgba(124,92,255,0.16) 100%)`,
  text: `linear-gradient(120deg, #FFFFFF 0%, #C9D3FF 45%, ${primitives.violet[400]} 100%)`,
  textLight: `linear-gradient(120deg, #1B2440 0%, ${primitives.indigo[600]} 55%, ${primitives.violet[600]} 100%)`,
};

/** Frosted-glass surface recipe. `elevated` adds depth for modals/popovers. */
export const glass = (mode, { elevated = false, hover = false } = {}) => {
  const t = semantic[mode];
  const dark = mode === "dark";
  return {
    backgroundColor: elevated ? t.surfaceStrong : t.surface,
    /* specular highlight anchored to the top-left corner. Radial, not linear:
       a linear sheen reads as a hard diagonal band once a panel gets wide. */
    /* fixed px radius, not a percentage: a %-sized highlight keeps growing
       with the panel and washes across wide tables */
    backgroundImage: dark
      ? "radial-gradient(520px 300px at 0% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0) 100%)"
      : "radial-gradient(520px 300px at 0% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)",
    backdropFilter: `blur(${elevated ? 28 : 20}px) saturate(118%)`,
    WebkitBackdropFilter: `blur(${elevated ? 28 : 20}px) saturate(118%)`,
    border: `1px solid ${t.border}`,
    boxShadow: dark
      ? elevated
        ? "0 32px 64px -16px rgba(0,0,0,0.75), inset 0 1px 0 0 rgba(255,255,255,0.08)"
        : "0 8px 32px -12px rgba(0,0,0,0.55), inset 0 1px 0 0 rgba(255,255,255,0.06)"
      : elevated
      ? "0 32px 64px -20px rgba(21,32,61,0.28), inset 0 1px 0 0 rgba(255,255,255,0.9)"
      : "0 8px 28px -14px rgba(21,32,61,0.18), inset 0 1px 0 0 rgba(255,255,255,0.75)",
    transition: `background ${motion.base}ms ${motion.ease}, border-color ${motion.base}ms ${motion.ease}, box-shadow ${motion.base}ms ${motion.ease}, transform ${motion.base}ms ${motion.ease}`,
    ...(hover && {
      "&:hover": {
        // backgroundColor, not background — the shorthand would drop the sheen
        backgroundColor: t.surfaceHover,
        borderColor: t.borderStrong,
        transform: "translateY(-2px)",
      },
    }),
  };
};

/** Hairline light catching the top edge of a glass panel. */
export const topSheen = (mode) => ({
  content: '""',
  position: "absolute",
  inset: "0 auto auto 0",
  width: "100%",
  height: 1,
  background: `linear-gradient(90deg, transparent, ${semantic[mode].sheen}, transparent)`,
  pointerEvents: "none",
});

export const glow = (color, strength = 0.35) =>
  `0 0 0 1px ${color}33, 0 8px 28px -6px ${color}${Math.round(strength * 255)
    .toString(16)
    .padStart(2, "0")}`;
