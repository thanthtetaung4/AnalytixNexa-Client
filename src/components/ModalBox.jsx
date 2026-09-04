import { styled, Box } from "@mui/material";

/**
 * Legacy centred modal surface. New code should use `ui/GlassDialog`, which
 * adds the header, close affordance and focus handling; this is kept so any
 * remaining `Modal` usages still render on the glass palette.
 */
const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "calc(100% - 32px)",
  maxWidth: 420,
  padding: 24,
  borderRadius: 20,
  textAlign: "center",
  outline: "none",
  color: theme.palette.text.primary,
  background: theme.palette.glass.surfaceStrong,
  backdropFilter: "blur(28px) saturate(150%)",
  WebkitBackdropFilter: "blur(28px) saturate(150%)",
  border: `1px solid ${theme.palette.glass.border}`,
  boxShadow: "0 32px 64px -16px rgba(0,0,0,0.6)",
}));

export default ModalBox;
