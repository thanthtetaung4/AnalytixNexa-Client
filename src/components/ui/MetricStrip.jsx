import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import GlassCard from "./GlassCard";
import AnimatedNumber from "./AnimatedNumber";

/**
 * A row of headline numbers in one surface.
 *
 * Replaces a grid of four `StatCard`s on the Overview page. Four cards is four
 * borders, four shadows, four icon medallions and four spotlight handlers to
 * carry four numbers — the chrome outweighed the content and pushed the actual
 * analysis below the fold. One card with hairline dividers reads as a single
 * summary line, which is what it is.
 *
 * `StatCard` is still the right component where a metric is the subject of its
 * own tile rather than one of a set.
 */
const MetricStrip = ({ metrics, delay }) => {
  const theme = useTheme();

  return (
    <GlassCard padding={0} delay={delay} sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: `repeat(${metrics.length}, 1fr)`,
          },
        }}
      >
        {metrics.map((metric, index) => {
          const tone = metric.accent || theme.palette.primary.main;
          const numeric =
            metric.value !== null &&
            metric.value !== undefined &&
            metric.value !== "" &&
            !Number.isNaN(Number(metric.value));

          return (
            <Box
              key={metric.label}
              sx={{
                position: "relative",
                px: { xs: 1.75, sm: 2.25 },
                py: { xs: 1.5, sm: 1.75 },
                // Hairlines between cells rather than around them. Border-left
                // on every cell but the first works for the md row; the xs
                // two-column wrap needs the top border on the later rows.
                borderLeft:
                  index % 2 === 1
                    ? `1px solid ${theme.palette.glass.border}`
                    : "none",
                borderTop:
                  index > 1 ? `1px solid ${theme.palette.glass.border}` : "none",
                [theme.breakpoints.up("md")]: {
                  borderTop: "none",
                  borderLeft:
                    index > 0
                      ? `1px solid ${theme.palette.glass.border}`
                      : "none",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                {metric.icon && (
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      color: tone,
                      "& svg": { fontSize: 15 },
                    }}
                  >
                    {metric.icon}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metric.label}
                </Typography>
              </Box>

              <Typography
                variant="metric"
                component="p"
                sx={{ color: "text.primary", fontSize: "1.375rem", lineHeight: 1.2 }}
              >
                {numeric ? (
                  <AnimatedNumber
                    value={metric.value}
                    decimals={metric.decimals ?? 0}
                    prefix={metric.prefix ?? ""}
                    suffix={metric.suffix ?? ""}
                  />
                ) : (
                  <Box component="span" sx={{ color: "text.disabled" }}>
                    —
                  </Box>
                )}
              </Typography>

              {metric.caption && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.25,
                    color: "text.disabled",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metric.caption}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </GlassCard>
  );
};

MetricStrip.propTypes = {
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      caption: PropTypes.node,
      icon: PropTypes.node,
      accent: PropTypes.string,
      decimals: PropTypes.number,
      prefix: PropTypes.string,
      suffix: PropTypes.string,
    })
  ).isRequired,
  delay: PropTypes.number,
};

export default MetricStrip;
