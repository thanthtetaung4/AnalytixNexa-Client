import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts up to `value` on mount. Renders in tabular mono figures so the
 * number never reflows while it ticks.
 */
const AnimatedNumber = ({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  sx = {},
}) => {
  const target = Number(value);
  const safe = Number.isFinite(target) ? target : 0;
  const [display, setDisplay] = useState(prefersReducedMotion() ? safe : 0);
  const frame = useRef();

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(safe);
      return undefined;
    }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      // expo-out, matching the theme easing
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(safe * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [safe, duration]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Box
      component="span"
      sx={{ fontVariantNumeric: "tabular-nums", ...sx }}
      /* screen readers get the final value, not the animating one */
      aria-label={`${prefix}${safe.toLocaleString()}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {formatted}
        {suffix}
      </span>
    </Box>
  );
};

AnimatedNumber.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  duration: PropTypes.number,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  sx: PropTypes.object,
};

export default AnimatedNumber;
