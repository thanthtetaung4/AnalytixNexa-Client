import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";

/**
 * The workhorse surface: frosted glass, hairline border, top-edge sheen.
 *
 * - `spotlight` adds a cursor-following radial highlight (desktop only —
 *   it is driven by pointer position, so touch users simply never see it and
 *   lose nothing).
 * - `interactive` adds the hover lift + stronger border.
 * - `accent` tints the border and adds a coloured glow (for KPI emphasis).
 */
const GlassCard = ({
  children,
  spotlight = false,
  interactive = false,
  elevated = false,
  accent,
  padding = 3,
  sx = {},
  delay,
  ...rest
}) => {
  const theme = useTheme();
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [active, setActive] = useState(false);

  const onMove = useCallback(
    (e) => {
      if (!spotlight || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    },
    [spotlight]
  );

  return (
    <Box
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => spotlight && setActive(true)}
      onMouseLeave={() => spotlight && setActive(false)}
      sx={{
        position: "relative",
        borderRadius: `${theme.shape.borderRadius + 4}px`,
        p: padding,
        overflow: "hidden",
        ...theme.glass({ elevated, hover: interactive }),
        ...(accent && {
          borderColor: `${accent}44`,
          boxShadow: `0 8px 32px -14px ${accent}55, inset 0 1px 0 0 ${theme.palette.glass.sheen}`,
        }),
        ...(delay !== undefined && {
          animation: `rise-in ${theme.motion.slow}ms ${theme.motion.ease} both`,
          animationDelay: `${delay}ms`,
        }),
        /* top-edge sheen */
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.palette.glass.sheen}, transparent)`,
          pointerEvents: "none",
        },
        ...sx,
      }}
      {...rest}
    >
      {spotlight && (
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            opacity: active ? 1 : 0,
            transition: `opacity ${theme.motion.slow}ms ${theme.motion.ease}`,
            pointerEvents: "none",
            background: `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, ${
              accent || theme.palette.primary.main
            }1F, transparent 70%)`,
          }}
        />
      )}
      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
};

GlassCard.propTypes = {
  children: PropTypes.node,
  spotlight: PropTypes.bool,
  interactive: PropTypes.bool,
  elevated: PropTypes.bool,
  accent: PropTypes.string,
  padding: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  sx: PropTypes.object,
  delay: PropTypes.number,
};

export default GlassCard;
