import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/**
 * Ambient aurora ground for the whole app shell: a base gradient, three slowly
 * drifting colour blobs, and a hairline grid. Purely decorative — it sits at
 * z-index 0 behind everything and is inert to pointers.
 *
 * `fixed` keeps it pinned to the viewport (dashboard shell); pass false to
 * scope it to a positioned parent.
 */
const AuroraBackground = ({ fixed = true, intensity = 1 }) => {
  const theme = useTheme();
  const g = theme.palette.glass;
  const [a, b, c] = g.aurora;

  const blob = (color, size, top, left, animation, duration) => ({
    position: "absolute",
    top,
    left,
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 68%)`,
    filter: `blur(${Math.round(80 * intensity)}px)`,
    animation: `${animation} ${duration}s ease-in-out infinite`,
    willChange: "transform",
  });

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% -10%, ${g.bgDeep} 0%, ${theme.palette.background.default} 60%)`,
      }}
    >
      <Box sx={blob(a, "46vw", "-14vh", "-8vw", "aurora-drift-a", 26)} />
      <Box sx={blob(b, "40vw", "34vh", "62vw", "aurora-drift-b", 32)} />
      <Box sx={blob(c, "34vw", "68vh", "12vw", "aurora-drift-c", 38)} />
      {/* faint technical grid — reads as precision, not decoration */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${g.grid} 1px, transparent 1px), linear-gradient(90deg, ${g.grid} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(115% 85% at 50% 0%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(115% 85% at 50% 0%, #000 20%, transparent 75%)",
        }}
      />
    </Box>
  );
};

AuroraBackground.propTypes = {
  fixed: PropTypes.bool,
  intensity: PropTypes.number,
};

export default AuroraBackground;
