import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Link as MUILink,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";

import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../components/useAuth";
import AuthShell from "../components/AuthShell";
import { GlassCard, GradientText } from "../components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInAsDemo, demoCredentials } = useAuth();

  const [isRemember, setIsRemember] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [credential, setCredential] = useState({ email: "", pwd: "" });
  const [pending, setPending] = useState(null); // "form" | "demo"

  // AuthGuard records the page that bounced them here; a password change
  // leaves a note explaining why the session ended.
  const redirectTo = location.state?.from || "/dashboard";
  const notice = location.state?.notice;

  const handleEmailChange = (email) => {
    setIsEmailValid(EMAIL_RE.test(email));
    setCredential((prev) => ({ ...prev, email }));
  };

  const handlePwdChange = (pwd) => {
    setCredential((prev) => ({ ...prev, pwd }));
  };

  const attempt = async (kind, action) => {
    setErrorMsg("");
    setPending(kind);
    try {
      await action();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Sign-in failed:", error);
      setPending(null);
      setErrorMsg(
        error?.status === 401
          ? "That email and password combination did not match an account."
          : error?.message ||
              "Could not sign you in right now. Please try again."
      );
    }
  };

  const handleSignIn = () =>
    attempt("form", () =>
      signIn(credential.email, credential.pwd, isRemember)
    );

  const handleDemoSignIn = () => attempt("demo", signInAsDemo);

  // only surface the email error once the field has been left, so the message
  // does not fight the user mid-typing
  const showEmailError = emailTouched && !isEmailValid && credential.email !== "";
  const loading = pending !== null;
  const canSubmit =
    credential.email !== "" && credential.pwd !== "" && !loading;

  return (
    <AuthShell>
      <GlassCard padding={{ xs: 3, sm: 4 }} delay={0}>
        <Typography variant="subtitle2" sx={{ color: "primary.light", mb: 1 }}>
          Welcome back
        </Typography>
        <GradientText variant="h3" component="h1" sx={{ pb: 0.5 }}>
          Sign in
        </GradientText>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Pick up your dashboards, files and saved analyses.
        </Typography>

        {notice && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {notice}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            canSubmit && handleSignIn();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            value={credential.email}
            error={showEmailError}
            helperText={showEmailError ? "Enter a valid email address" : " "}
            onBlur={() => setEmailTouched(true)}
            onChange={(e) => handleEmailChange(e.target.value)}
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

          <TextField
            fullWidth
            label="Password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            value={credential.pwd}
            onChange={(e) => handlePwdChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    fontSize="small"
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPwd((p) => !p)}
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

          {errorMsg && (
            <Alert severity="error" role="alert">
              {errorMsg}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRemember}
                  onChange={(e) => setIsRemember(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Keep me signed in
                </Typography>
              }
              sx={{ userSelect: "none" }}
            />
            <MUILink
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ fontWeight: 600, color: theme.palette.primary.light }}
            >
              Forgot password?
            </MUILink>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!canSubmit}
            startIcon={
              pending === "form" ? (
                <CircularProgress size={17} sx={{ color: "inherit" }} />
              ) : (
                <LoginRoundedIcon />
              )
            }
          >
            {pending === "form" ? "Signing in…" : "Sign in"}
          </Button>

          <Divider>or</Divider>

          {/* The demo account is seeded with datasets and finished analyses, so
              the workspace has something to show without an upload first. */}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleDemoSignIn}
            disabled={loading}
            startIcon={
              pending === "demo" ? (
                <CircularProgress size={17} sx={{ color: "inherit" }} />
              ) : (
                <PlayCircleOutlineRoundedIcon />
              )
            }
          >
            {pending === "demo" ? "Opening demo…" : "Explore the demo workspace"}
          </Button>
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", textAlign: "center", mt: -1 }}
          >
            Signs in as {demoCredentials.email} with sample sales data.
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 3, textAlign: "center" }}
        >
          New to AnalytixNexa?{" "}
          <MUILink
            component="button"
            type="button"
            onClick={() => navigate("/signup")}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.light,
            }}
          >
            Create an account
          </MUILink>
        </Typography>
      </GlassCard>
    </AuthShell>
  );
};

export default Login;
