import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/**
 * The empty state is a first-class screen, not an afterthought: it names the
 * situation and always offers the next action.
 */
const EmptyState = ({ icon, title, description, action, sx = {} }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1.5,
        py: 6,
        px: 3,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 60,
            height: 60,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            mb: 0.5,
            color: "primary.light",
            background: theme.gradients.brandSoft,
            border: `1px solid ${theme.palette.glass.border}`,
            "& svg": { fontSize: 28 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 420 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
  sx: PropTypes.object,
};

export default EmptyState;
