import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/**
 * Branded loading state. Uses a rotating conic ring rather than a bare
 * spinner, and reserves vertical space so there is no layout shift when the
 * real content arrives.
 */
const LoadingScreen = ({ label = "Loading", minHeight = 320 }) => {
  const theme = useTheme();
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0%, ${theme.palette.primary.main} 70%, ${theme.palette.secondary.main} 100%)`,
          animation: "spin-slow 1.1s linear infinite",
          display: "grid",
          placeItems: "center",
          "&::after": {
            content: '""',
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: theme.palette.background.default,
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

LoadingScreen.propTypes = {
  label: PropTypes.string,
  minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default LoadingScreen;
