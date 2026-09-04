import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { confirmPasswordReset } from "../api/auth";
import AuthShell from "../components/AuthShell";
import { GlassCard, GradientText } from "../components/ui";

/** Mirrors the API's policy in `validate_password_strength`. */
const PWD_MIN_LENGTH = 8;
const isMixed = (pwd) => !/^\d+$/.test(pwd) && !/^[A-Za-z]+$/.test(pwd);

/**
 * The page a reset email links to.
 *
 * The token arrives in the query string. On success every session is revoked
 * server-side, so there is no signed-in state to land in — the user goes to
 * sign-in with a note saying why.
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [passwords, setPasswords] = useState({ next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const strongEnough =
    passwords.next.length >= PWD_MIN_LENGTH && isMixed(passwords.next);
  const matches = passwords.confirm !== "" && passwords.next === passwords.confirm;
  const canSubmit = Boolean(token) && strongEnough && matches && !saving;

  const submit = async () => {
    setErrorMsg("");
    setSaving(true);
    try {
      await confirmPasswordReset(token, passwords.next);
      navigate("/login", {
        replace: true,
        state: {
          notice:
            "Password updated. Every device was signed out — sign in with your new password.",
        },
      });
    } catch (error) {
      console.error("Password reset failed:", error);
      setSaving(false);
      setErrorMsg(
        error?.code === "invalid_reset_token"
          ? "This link is invalid or has expired. Request a new one and try again."
          : error?.message || "Could not reset your password. Please try again."
      );
    }
  };

  // A missing token means the URL was truncated or typed by hand, and nothing
  // on this form can succeed — so say that instead of letting them fill it in.
  if (!token) {
    return (
      <AuthShell>
        <GlassCard padding={{ xs: 3, sm: 4 }} delay={0}>
          <Box
            sx={{
              width: 44,
              height: 44,
              mb: 2,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "error.main",
              bgcolor: (theme) => `${theme.palette.error.main}1A`,
              border: (theme) => `1px solid ${theme.palette.error.main}33`,
            }}
          >
            <ErrorOutlineRoundedIcon />
          </Box>
          <GradientText variant="h4" component="h1" sx={{ pb: 0.5 }}>
            This link is incomplete
          </GradientText>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            The reset link is missing its token. Email clients sometimes cut long
            links in half — request a fresh one and open it in one click.
          </Typography>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            size="large"
            fullWidth
          >
            Request a new link
          </Button>
        </GlassCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <GlassCard padding={{ xs: 3, sm: 4 }} delay={0}>
        <Typography variant="subtitle2" sx={{ color: "primary.light", mb: 1 }}>
          Password reset
        </Typography>
        <GradientText variant="h4" component="h1" sx={{ pb: 0.5 }}>
          Choose a new password
        </GradientText>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          At least {PWD_MIN_LENGTH} characters, mixing letters with digits or
          symbols. Saving it signs you out on every device.
        </Typography>

        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) submit();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            autoFocus
            label="New password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            value={passwords.next}
            error={passwords.next !== "" && !strongEnough}
            helperText={
              passwords.next !== "" && !strongEnough
                ? "Too simple for the policy above"
                : " "
            }
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, next: event.target.value }))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPwd((prev) => !prev)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    edge="end"
                    size="small"
                  >
                    {showPwd ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm new password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            value={passwords.confirm}
            error={passwords.confirm !== "" && !matches}
            helperText={
              passwords.confirm !== "" && !matches ? "These do not match" : " "
            }
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, confirm: event.target.value }))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          {errorMsg && (
            <Alert
              severity="error"
              role="alert"
              action={
                <Button
                  color="inherit"
                  size="small"
                  component={RouterLink}
                  to="/forgot-password"
                >
                  New link
                </Button>
              }
            >
              {errorMsg}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!canSubmit}
            startIcon={
              saving ? (
                <CircularProgress size={17} sx={{ color: "inherit" }} />
              ) : (
                <LockResetRoundedIcon />
              )
            }
          >
            {saving ? "Updating…" : "Set new password"}
          </Button>
        </Box>
      </GlassCard>
    </AuthShell>
  );
};

export default ResetPassword;
