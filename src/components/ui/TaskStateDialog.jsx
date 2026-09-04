import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PropTypes from "prop-types";
import GlassDialog from "./GlassDialog";

/**
 * One dialog for the three states of a long task (running / succeeded /
 * failed). Previously each page hand-rolled this and left the copy ambiguous;
 * here the state drives the icon, the tone and the message together.
 */
const TaskStateDialog = ({
  open,
  onClose,
  running,
  success,
  errorMessage,
  runningTitle,
  runningBody,
  successTitle,
  successBody,
  failTitle,
}) => {
  const state = running ? "running" : success ? "success" : "error";

  const meta = {
    running: {
      title: runningTitle,
      body: runningBody,
      tone: "primary.light",
      icon: <CircularProgress size={22} thickness={4.5} />,
    },
    success: {
      title: successTitle,
      body: successBody,
      tone: "success.main",
      icon: <CheckCircleRoundedIcon />,
    },
    error: {
      title: failTitle,
      body:
        (typeof errorMessage === "string" && errorMessage) ||
        "Something went wrong. Please try again.",
      tone: "error.main",
      icon: <ErrorRoundedIcon />,
    },
  }[state];

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      dismissible={!running}
      title={meta.title}
      maxWidth={400}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2 }}
        role="status"
        aria-live="polite"
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            color: meta.tone,
            bgcolor: "action.hover",
            "& svg": { fontSize: 24 },
          }}
        >
          {meta.icon}
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {meta.body}
        </Typography>
      </Box>
    </GlassDialog>
  );
};

TaskStateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  running: PropTypes.bool,
  success: PropTypes.bool,
  errorMessage: PropTypes.any,
  runningTitle: PropTypes.string,
  runningBody: PropTypes.string,
  successTitle: PropTypes.string,
  successBody: PropTypes.string,
  failTitle: PropTypes.string,
};

TaskStateDialog.defaultProps = {
  runningTitle: "Working…",
  runningBody: "This will only take a moment.",
  successTitle: "Done",
  successBody: "Completed successfully.",
  failTitle: "Something went wrong",
};

export default TaskStateDialog;
