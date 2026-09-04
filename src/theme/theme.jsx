import {
  semantic,
  radii,
  motion,
  typography as fonts,
  gradients,
  glass,
} from "./tokens";

/**
 * Builds the full MUI theme for a mode. Every visual decision for the app is
 * centralised here — components should read `theme.palette.*` / `theme.glass`
 * rather than importing tokens directly, so a token change propagates once.
 */
export const getDesignTokens = (rawMode) => {
  const mode = rawMode === "light" ? "light" : "dark";
  const t = semantic[mode];
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: {
        main: t.primary,
        light: t.primaryHover,
        dark: isDark ? "#3449C4" : "#2A3A9C",
        contrastText: t.onPrimary,
      },
      secondary: { main: t.accent, contrastText: "#FFFFFF" },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.danger },
      info: { main: t.info },
      background: { default: t.bgBase, paper: t.bgElevated },
      text: {
        primary: t.text,
        secondary: t.textMuted,
        disabled: t.textFaint,
      },
      divider: t.border,
      /* kept for backwards compatibility with existing modal styling */
      modal: { main: t.bgElevated },
      /* the glass vocabulary, exposed to components */
      glass: {
        surface: t.surface,
        surfaceStrong: t.surfaceStrong,
        surfaceHover: t.surfaceHover,
        inputBg: t.inputBg,
        border: t.border,
        borderStrong: t.borderStrong,
        sheen: t.sheen,
        grid: t.grid,
        aurora: t.aurora,
        bgDeep: t.bgDeep,
      },
    },

    /* exposed helpers: theme.glass(), theme.gradients, theme.motion */
    glass: (opts) => glass(mode, opts),
    gradients: {
      ...gradients,
      text: isDark ? gradients.text : gradients.textLight,
    },
    motion,

    shape: { borderRadius: radii.md },

    typography: {
      fontFamily: fonts.sans,
      /* fluid, tightly-tracked display type — the premium tell */
      h1: {
        fontFamily: fonts.sans,
        fontWeight: 700,
        fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
        lineHeight: 1.05,
        letterSpacing: "-0.035em",
      },
      h2: {
        fontWeight: 700,
        fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
        lineHeight: 1.12,
        letterSpacing: "-0.03em",
      },
      h3: {
        fontWeight: 650,
        fontSize: "clamp(1.5rem, 2.6vw, 1.875rem)",
        lineHeight: 1.2,
        letterSpacing: "-0.025em",
      },
      h4: {
        fontWeight: 650,
        fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
        lineHeight: 1.25,
        letterSpacing: "-0.02em",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.125rem",
        lineHeight: 1.35,
        letterSpacing: "-0.015em",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.4,
        letterSpacing: "-0.01em",
      },
      subtitle1: { fontWeight: 550, letterSpacing: "-0.01em" },
      subtitle2: {
        fontWeight: 600,
        fontSize: "0.75rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
      body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", lineHeight: 1.6 },
      caption: { fontSize: "0.75rem", lineHeight: 1.5, letterSpacing: "0.01em" },
      button: {
        fontWeight: 600,
        fontSize: "0.875rem",
        letterSpacing: "-0.005em",
        textTransform: "none",
      },
      /* opt-in variant for metrics: tabular mono figures */
      metric: {
        fontFamily: fonts.mono,
        fontWeight: 600,
        fontSize: "clamp(1.5rem, 3vw, 2rem)",
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        fontVariantNumeric: "tabular-nums",
      },
      mono: {
        fontFamily: fonts.mono,
        fontSize: "0.8125rem",
        fontVariantNumeric: "tabular-nums",
      },
    },

    transitions: {
      duration: {
        shortest: 120,
        shorter: motion.fast,
        short: 200,
        standard: motion.base,
        complex: motion.slow,
        enteringScreen: 260,
        leavingScreen: 200,
      },
      easing: {
        easeInOut: motion.ease,
        easeOut: motion.ease,
        easeIn: motion.easeIn,
        sharp: motion.ease,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // `:root` (0,1,0) outranks the `html` anti-flash rule in index.html
          // (0,0,1), so the pre-mount dark ground is replaced once mounted
          ":root": { colorScheme: mode, backgroundColor: t.bgDeep },
          "*, *::before, *::after": { boxSizing: "border-box" },
          html: {
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility",
          },
          body: {
            backgroundColor: t.bgDeep,
            color: t.text,
            minHeight: "100vh",
            overflowX: "hidden",
          },
          /* keyboard focus is always visible — never traded for aesthetics */
          ":focus-visible": {
            outline: `2px solid ${t.primary}`,
            outlineOffset: 2,
            borderRadius: 6,
          },
          "::selection": {
            background: `${t.primary}55`,
            color: t.text,
          },
          "::-webkit-scrollbar": { width: 10, height: 10 },
          "::-webkit-scrollbar-track": { background: "transparent" },
          "::-webkit-scrollbar-thumb": {
            background: t.borderStrong,
            borderRadius: 999,
            border: "3px solid transparent",
            backgroundClip: "content-box",
          },
          "::-webkit-scrollbar-thumb:hover": { background: t.primary },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: radii.lg,
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            minHeight: 44, // 44×44 touch target
            padding: "10px 18px",
            transition: `all ${motion.base}ms ${motion.ease}`,
            "&:active": { transform: "scale(0.975)" },
          },
          containedPrimary: {
            background: gradients.brand,
            color: "#FFFFFF",
            boxShadow: `0 8px 24px -8px ${t.primary}88`,
            "&:hover": {
              background: gradients.brandHover,
              boxShadow: `0 12px 32px -8px ${t.primary}AA`,
            },
            "&.Mui-disabled": {
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(15,23,42,0.06)",
              color: isDark ? "rgba(237,239,247,0.42)" : "rgba(15,23,42,0.4)",
              boxShadow: "none",
            },
          },
          outlined: {
            borderColor: t.borderStrong,
            color: t.text,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            "&:hover": {
              borderColor: t.primary,
              background: t.surfaceHover,
            },
          },
          text: {
            color: t.textMuted,
            "&:hover": { background: t.surface, color: t.text },
          },
          sizeSmall: { minHeight: 36, padding: "6px 12px" },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: t.textMuted,
            borderRadius: radii.md,
            // 44x44 minimum hit area even at size="small" — the icon stays
            // small, only the target grows
            minWidth: 44,
            minHeight: 44,
            transition: `all ${motion.fast}ms ${motion.ease}`,
            "&:hover": { background: t.surfaceHover, color: t.text },
            "&:active": { transform: "scale(0.94)" },
          },
          sizeSmall: { padding: 10 },
        },
      },

      MuiTextField: { defaultProps: { variant: "outlined" } },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            /* inputs sit *into* the panel, so they go darker than the glass
               rather than lighter — otherwise they read as raised buttons */
            backgroundColor: t.inputBg,
            backdropFilter: "blur(12px)",
            transition: `all ${motion.base}ms ${motion.ease}`,
            "& fieldset": {
              borderColor: t.border,
              transition: `border-color ${motion.base}ms ${motion.ease}`,
            },
            "&:hover fieldset": { borderColor: t.borderStrong },
            "&.Mui-focused": {
              backgroundColor: isDark ? "rgba(7, 9, 17, 0.72)" : "#FFFFFF",
              boxShadow: `0 0 0 4px ${t.primary}2E`,
            },
            "&.Mui-focused fieldset": {
              borderColor: t.primary,
              borderWidth: 1,
            },
          },
          input: { padding: "13px 14px" },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { color: t.textMuted, "&.Mui-focused": { color: t.primary } },
        },
      },

      MuiFormHelperText: {
        styleOverrides: { root: { marginLeft: 2, fontSize: "0.75rem" } },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: t.textFaint,
            // same rule as icon buttons: a small checkbox still needs a
            // finger-sized target
            minWidth: 44,
            minHeight: 44,
            "&.Mui-checked": { color: t.primary },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.border },
          withChildren: {
            "&::before, &::after": { borderColor: t.border },
          },
          wrapper: {
            color: t.textFaint,
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            border: `1px solid ${t.border}`,
            alignItems: "center",
            // no backdrop blur: alerts live inside glass panels, and stacking
            // a second blur layer turns the tint muddy
          },
          standardWarning: {
            // near-opaque in dark mode: a translucent tint lets the panel's
            // specular highlight bleed through and turns the amber muddy
            background: isDark
              ? "rgba(43, 31, 10, 0.88)"
              : "rgba(254, 243, 218, 0.92)",
            color: isDark ? "#FCD34D" : "#92400E",
            borderColor: isDark
              ? "rgba(245,158,11,0.28)"
              : "rgba(245,158,11,0.35)",
          },
          standardError: {
            background: isDark
              ? "rgba(44, 18, 20, 0.88)"
              : "rgba(254, 231, 231, 0.92)",
            color: isDark ? "#FCA5A5" : "#991B1B",
            borderColor: isDark ? "rgba(239,68,68,0.28)" : "rgba(239,68,68,0.3)",
          },
          standardSuccess: {
            background: isDark
              ? "rgba(13, 38, 24, 0.88)"
              : "rgba(224, 248, 232, 0.92)",
            color: isDark ? "#86EFAC" : "#166534",
            borderColor: "rgba(34,197,94,0.28)",
          },
          standardInfo: {
            background: isDark
              ? "rgba(10, 36, 42, 0.88)"
              : "rgba(222, 246, 250, 0.92)",
            color: isDark ? "#7DD3E8" : "#155E75",
            borderColor: "rgba(34,191,212,0.28)",
          },
        },
      },

      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: t.surface,
            backdropFilter: "blur(18px)",
            border: `1px solid ${t.border}`,
            borderRadius: `${radii.lg}px !important`,
            overflow: "hidden",
            transition: `all ${motion.base}ms ${motion.ease}`,
            "&::before": { display: "none" },
            "&:hover": { borderColor: t.borderStrong },
            "&.Mui-expanded": {
              backgroundColor: t.surfaceStrong,
              borderColor: t.borderStrong,
            },
          },
        },
      },

      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 60,
            padding: "0 20px",
            "&.Mui-expanded": { minHeight: 60 },
          },
          content: { margin: "14px 0", "&.Mui-expanded": { margin: "14px 0" } },
          expandIconWrapper: { color: t.textMuted },
        },
      },

      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: 20,
            borderTop: `1px solid ${t.border}`,
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: t.border,
            padding: "14px 16px",
            fontSize: "0.875rem",
          },
          head: {
            color: t.textMuted,
            fontWeight: 600,
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(15,23,42,0.02)",
            whiteSpace: "nowrap",
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: `background ${motion.fast}ms ${motion.ease}`,
            "&:last-child td": { borderBottom: "none" },
            "&:hover": { background: t.surface },
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: { borderTop: `1px solid ${t.border}`, color: t.textMuted },
          selectIcon: { color: t.textMuted },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: isDark ? "#141A2B" : "#1B2440",
            border: `1px solid ${t.borderStrong}`,
            borderRadius: radii.sm,
            fontSize: "0.75rem",
            padding: "6px 10px",
            backdropFilter: "blur(12px)",
          },
          arrow: { color: isDark ? "#141A2B" : "#1B2440" },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radii.pill,
            fontWeight: 600,
            fontSize: "0.75rem",
            height: 26,
            border: `1px solid ${t.border}`,
            background: t.surface,
          },
        },
      },

      MuiBackdrop: {
        styleOverrides: {
          root: {
            background: isDark
              ? "rgba(3, 5, 12, 0.66)"
              : "rgba(20, 28, 50, 0.34)",
            backdropFilter: "blur(8px)",
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            transition: `all ${motion.base}ms ${motion.ease}`,
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: { "&.Mui-checked + .MuiSwitch-track": { opacity: 0.9 } },
          track: { background: t.borderStrong, opacity: 1 },
        },
      },

      MuiLink: {
        styleOverrides: {
          root: {
            color: t.primary,
            textDecorationColor: `${t.primary}55`,
            transition: `color ${motion.fast}ms ${motion.ease}`,
            "&:hover": { color: t.primaryHover },
            // inline-flex + minHeight gives an inline link a full-height hit
            // area without pushing it out of the sentence it sits in
            "&.MuiLink-button": {
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              verticalAlign: "middle",
              background: "none",
              border: "none",
              font: "inherit",
              cursor: "pointer",
            },
          },
        },
      },

      MuiCircularProgress: { styleOverrides: { root: { color: t.primary } } },
    },
  };
};

export default getDesignTokens;
