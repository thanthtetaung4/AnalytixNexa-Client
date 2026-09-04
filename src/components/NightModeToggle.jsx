import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useThemeContext } from "../theme/ThemeContextProvider";

const OPTIONS = [
  { value: "light", label: "Light", icon: <LightModeRoundedIcon /> },
  { value: "dark", label: "Dark", icon: <DarkModeRoundedIcon /> },
];

/**
 * Segmented appearance control. A two-state segmented switch shows both
 * choices and which one is active — a single toggle icon only ever shows one
 * of the two and leaves the current state ambiguous.
 */
const NightModeToggle = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Box
      role="radiogroup"
      aria-label="Colour theme"
      sx={{
        display: "inline-flex",
        p: 0.5,
        gap: 0.5,
        borderRadius: 999,
        bgcolor: theme.palette.glass.surface,
        border: `1px solid ${theme.palette.glass.border}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => !active && toggleColorMode()}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.875,
              px: 2,
              py: 1,
              minHeight: 40,
              border: "none",
              borderRadius: 999,
              cursor: active ? "default" : "pointer",
              color: active ? "#fff" : theme.palette.text.secondary,
              background: active ? theme.gradients.brand : "transparent",
              boxShadow: active
                ? `0 6px 18px -8px ${theme.palette.primary.main}`
                : "none",
              transition: `all ${theme.motion.base}ms ${theme.motion.ease}`,
              "&:hover": {
                color: active ? "#fff" : theme.palette.text.primary,
                background: active
                  ? theme.gradients.brand
                  : theme.palette.glass.surfaceHover,
              },
              "& svg": { fontSize: 17 },
            }}
          >
            {opt.icon}
            <Typography
              component="span"
              sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              {opt.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default NightModeToggle;
