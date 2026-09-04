import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";

/** Headline type with the brand gradient clipped to the glyphs. */
const GradientText = ({ children, sx = {}, ...rest }) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        background: theme.gradients.text,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
};

GradientText.propTypes = { children: PropTypes.node, sx: PropTypes.object };

export default GradientText;
