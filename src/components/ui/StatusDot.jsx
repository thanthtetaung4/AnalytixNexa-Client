import { Box } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Pulsing presence indicator. Colour alone never carries the meaning — always
 * pair it with the adjacent label text.
 */
const StatusDot = ({ color = "success.main", size = 8, pulse = true }) => (
  <Box
    aria-hidden="true"
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      bgcolor: color,
      color,
      flexShrink: 0,
      position: "relative",
      ...(pulse && {
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          animation: "pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        },
      }),
    }}
  />
);

StatusDot.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  pulse: PropTypes.bool,
};

export default StatusDot;
