import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link as MUILink,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { requestPasswordReset } from "../api/auth";
import AuthShell from "../components/AuthShell";
import { GlassCard, GradientText } from "../components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Ask for a reset link.
 *
 * The confirmation is deliberately the same whether or not the address has an
 * account — the API refuses to say which, because answering would let anyone
 * test who has signed up here. So the success screen says "if that address has
 * an account", and never "we sent it".
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const valid = EMAIL_RE.test(email);
  const showError = touched && !valid && email !== "";

  const submit = async () => {
    setErrorMsg("");
    setSending(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (error) {
      console.error("Reset request failed:", error);
      setErrorMsg(
        error?.message || "Could not send the reset email right now. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell>
      <GlassCard padding={{ xs: 3, sm: 4 }} delay={0}>
        {sent ? (
          <Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                mb: 2,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "success.main",
                bgcolor: (theme) => `${theme.palette.success.main}1A`,
                border: (theme) => `1px solid ${theme.palette.success.main}33`,
              }}
            >
              <MarkEmailReadRoundedIcon />
            </Box>
            <GradientText variant="h4" component="h1" sx={{ pb: 0.5 }}>
              Check your inbox
            </GradientText>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              If <strong>{email.trim()}</strong> has an account, a reset link is
              on its way. It expires shortly and works only once.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled", mb: 3 }}>
              Nothing arrived? Check spam, then try again — requesting a new
              link cancels the previous one.
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<ArrowBackRoundedIcon />}
            >
              Back to sign in
            </Button>
            <Button
              variant="text"
              size="small"
              fullWidth
              onClick={() => setSent(false)}
              sx={{ mt: 1, color: "text.secondary" }}
            >
              Use a different email address
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ color: "primary.light", mb: 1 }}>
              Password reset
            </Typography>
            <GradientText variant="h4" component="h1" sx={{ pb: 0.5 }}>
              Forgot your password?
            </GradientText>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Enter the address you signed up with and we will email you a link
              to choose a new password.
            </Typography>

            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                if (valid && !sending) submit();
              }}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                autoFocus
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                error={showError}
                helperText={showError ? "Enter a valid email address" : " "}
                onBlur={() => setTouched(true)}
                onChange={(event) => setEmail(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon
                        fontSize="small"
                        sx={{ color: "text.disabled" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              {errorMsg && (
                <Alert severity="error" role="alert">
                  {errorMsg}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!valid || sending}
                startIcon={
                  sending ? (
                    <CircularProgress size={17} sx={{ color: "inherit" }} />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
              >
                {sending ? "Sending…" : "Email me a reset link"}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 3, textAlign: "center" }}
            >
              Remembered it?{" "}
              <MUILink
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: 600, color: "primary.light" }}
              >
                Back to sign in
              </MUILink>
            </Typography>
          </Box>
        )}
      </GlassCard>
    </AuthShell>
  );
};

export default ForgotPassword;
