import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import GlassCard from "./GlassCard";
import AnimatedNumber from "./AnimatedNumber";

/**
 * KPI tile: eyebrow label, big mono metric, optional caption, and a tinted
 * icon medallion. The accent colour is passed in so a row of tiles can carry
 * distinct hues without any component knowing about the palette.
 */
const StatCard = ({
  label,
  value,
  caption,
  icon,
  accent,
  decimals = 0,
  prefix = "",
  suffix = "",
  delay,
}) => {
  const theme = useTheme();
  const tone = accent || theme.palette.primary.main;
  const numeric = typeof value === "number" || !Number.isNaN(Number(value));

  return (
    <GlassCard spotlight interactive accent={tone} delay={delay} padding={2.5}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", mb: 1 }}
          >
            {label}
          </Typography>
          <Typography
            variant="metric"
            component="p"
            sx={{ color: "text.primary", display: "block" }}
          >
            {numeric && value !== null && value !== undefined && value !== "" ? (
              <AnimatedNumber
                value={value}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              <Box component="span" sx={{ color: "text.disabled" }}>
                —
              </Box>
            )}
          </Typography>
          {caption && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mt: 0.75,
                // clamp to two lines: a single ellipsised line cut most of
                // these captions mid-word in the 4-up grid
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {caption}
            </Typography>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              flexShrink: 0,
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              color: tone,
              background: `${tone}1A`,
              border: `1px solid ${tone}33`,
              "& svg": { fontSize: 21 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </GlassCard>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  caption: PropTypes.node,
  icon: PropTypes.node,
  accent: PropTypes.string,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  delay: PropTypes.number,
};

export default StatCard;
