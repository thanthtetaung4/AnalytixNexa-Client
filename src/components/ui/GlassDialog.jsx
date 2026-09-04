import { Box, IconButton, Modal, Typography, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import GlassCard from "./GlassCard";

/**
 * Centred glass dialog with a blurred backdrop, a titled header and a real
 * close affordance. Replaces the ad-hoc `Modal` + `ModalBox` pairs.
 *
 * `dismissible={false}` (used while an upload/analysis is in flight) removes
 * the close button as well as the backdrop click, so the UI never advertises
 * an action it will not honour.
 */
const GlassDialog = ({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  dismissible = true,
  maxWidth = 420,
}) => (
  <Modal
    open={open}
    onClose={dismissible ? onClose : undefined}
    closeAfterTransition
    aria-labelledby="glass-dialog-title"
  >
    <Fade in={open} timeout={240}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)",
          maxWidth,
          outline: "none",
        }}
      >
        <GlassCard elevated padding={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: children ? 2 : 0,
            }}
          >
            {icon && (
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.light",
                  bgcolor: "action.hover",
                  "& svg": { fontSize: 19 },
                }}
              >
                {icon}
              </Box>
            )}
            <Typography
              id="glass-dialog-title"
              variant="h6"
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              {title}
            </Typography>
            {dismissible && (
              <IconButton
                onClick={onClose}
                aria-label="Close dialog"
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {children}
          {actions && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
                flexWrap: "wrap",
              }}
            >
              {actions}
            </Box>
          )}
        </GlassCard>
      </Box>
    </Fade>
  </Modal>
);

GlassDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.node.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.node,
  dismissible: PropTypes.bool,
  maxWidth: PropTypes.number,
};

export default GlassDialog;
