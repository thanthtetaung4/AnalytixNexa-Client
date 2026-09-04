import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/** Logo lockup: gradient glyph tile + wordmark. `compact` hides the wordmark. */
const BrandMark = ({ compact = false, size = 34 }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          background: theme.gradients.brand,
          boxShadow: `0 6px 20px -6px ${theme.palette.primary.main}99`,
        }}
      >
        {/* abstract ascending-bars glyph */}
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: size * 0.56, height: size * 0.56 }}
          aria-hidden="true"
        >
          <rect x="3" y="13" width="4" height="8" rx="1.4" fill="#fff" opacity="0.68" />
          <rect x="10" y="8" width="4" height="13" rx="1.4" fill="#fff" opacity="0.86" />
          <rect x="17" y="3" width="4" height="18" rx="1.4" fill="#fff" />
        </Box>
      </Box>
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            sx={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.9375rem",
              letterSpacing: "-0.02em",
              color: "text.primary",
              lineHeight: 1.15,
            }}
          >
            Analytix<Box component="span" sx={{ color: "primary.light" }}>Nexa</Box>
          </Typography>
          <Typography
            component="span"
            sx={{
              display: "block",
              fontSize: "0.625rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.disabled",
            }}
          >
            Analytics
          </Typography>
        </Box>
      )}
    </Box>
  );
};

BrandMark.propTypes = { compact: PropTypes.bool, size: PropTypes.number };

export default BrandMark;
