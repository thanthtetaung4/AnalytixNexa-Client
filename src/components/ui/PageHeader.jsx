import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import GradientText from "./GradientText";

/**
 * Consistent page masthead: gradient title, subtitle, right slot.
 *
 * Sized down from h3 to h4 and given tighter spacing: the app bar above already
 * names the page, so a display-size heading was spending most of the first
 * screen restating it. `eyebrow` is still supported but no longer used on pages
 * whose title says the same word.
 */
const PageHeader = ({ eyebrow, title, subtitle, action, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 2,
      mb: 2.25,
      animation: "rise-in 320ms cubic-bezier(0.16,1,0.3,1) both",
      ...sx,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      {eyebrow && (
        <Typography variant="subtitle2" sx={{ color: "primary.light", mb: 0.5 }}>
          {eyebrow}
        </Typography>
      )}
      <GradientText variant="h4" component="h1" sx={{ pb: 0.25 }}>
        {title}
      </GradientText>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", maxWidth: 640 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  sx: PropTypes.object,
};

export default PageHeader;
