import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MUILink,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";

import useAuth from "../components/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { GlassCard, GradientText } from "../components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The API's floor: 8 characters, and letters mixed with digits or symbols. */
const PWD_MIN_LENGTH = 8;
const isPwdMixed = (pwd) => !/^\d+$/.test(pwd) && !/^[A-Za-z]+$/.test(pwd);

/** Cheap, honest strength read-out: length plus character-class variety. */
const scorePwd = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= PWD_MIN_LENGTH) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;
  return Math.min(score, 4);
};

const STRENGTH = [
  { label: "Too short", tone: "error.main" },
  { label: "Weak", tone: "error.main" },
  { label: "Fair", tone: "warning.main" },
  { label: "Good", tone: "info.main" },
  { label: "Strong", tone: "success.main" },
];

function SignUp() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [matchPwd, setMatchPwd] = useState("");
  const [tnc, setTnc] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEmailValid = EMAIL_RE.test(email);
  const isPwdMatch = pwd === matchPwd;
  const isPwdAccepted = pwd.length >= PWD_MIN_LENGTH && isPwdMixed(pwd);
  const strength = scorePwd(pwd);

  const isSignUpDisable = !(
    firstName.trim() &&
    lastName.trim() &&
    isEmailValid &&
    isPwdAccepted &&
    isPwdMatch &&
    tnc
  );

  const handleSignUp = async () => {
    try {
      setIsError(false);
      setIsLoading(true);
      // a space between the parts — the joined value becomes the display name
      await signUp(`${firstName.trim()} ${lastName.trim()}`, email, pwd);
      // signUp logs straight in, so go where the new account belongs
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setIsLoading(false);
      setIsError(true);

      console.error("Signup Error:", error.code, error.message);

      // The API answers with a stable `code`, so branch on that and fall back
      // to its own message rather than inventing one.
      switch (error.code) {
        case "conflict":
          setErrorMsg("Email is already in use. Please use a different email.");
          break;
        case "validation_error":
          setErrorMsg(
            error.details?.fields?.[0]?.msg ||
              error.message ||
              "Please check the details you entered."
          );
          break;
        case "network_error":
          setErrorMsg(
            "Could not reach the API. Check that the server is running."
          );
          break;
        default:
          setErrorMsg("An error occurred during signup. Please try again.");
      }
    }
  };

  const showEmailError = emailTouched && email !== "" && !isEmailValid;
  const showMatchError = confirmTouched && matchPwd !== "" && !isPwdMatch;

  return (
    <AuthShell maxWidth={480}>
      <GlassCard padding={{ xs: 3, sm: 4 }} delay={0}>
        <Typography variant="subtitle2" sx={{ color: "primary.light", mb: 1 }}>
          Get started
        </Typography>
        <GradientText variant="h3" component="h1" sx={{ pb: 0.5 }}>
          Create account
        </GradientText>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Free to start. Upload your first dataset in under a minute.
        </Typography>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            !isSignUpDisable && !isLoading && handleSignUp();
          }}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon
                      fontSize="small"
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={showEmailError}
            helperText={showEmailError ? "Enter a valid email address" : " "}
            onBlur={() => setEmailTouched(true)}
            onChange={(e) => setEmail(e.target.value)}
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

          <Box>
            <TextField
              fullWidth
              label="Password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={pwd}
              error={pwd !== "" && !isPwdAccepted}
              helperText={
                pwd !== "" && !isPwdAccepted
                  ? `At least ${PWD_MIN_LENGTH} characters, mixing letters with digits or symbols`
                  : " "
              }
              onChange={(e) => setPwd(e.target.value)}
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
            {/* strength meter: four segments + a word, so the signal is not
                carried by colour alone */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
                px: 0.5,
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      height: 3,
                      flexGrow: 1,
                      borderRadius: 999,
                      bgcolor:
                        pwd && strength >= i
                          ? STRENGTH[strength].tone
                          : theme.palette.glass.border,
                      transition: `background-color ${theme.motion.base}ms ${theme.motion.ease}`,
                    }}
                  />
                ))}
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", minWidth: 58 }}
              >
                {pwd ? STRENGTH[strength].label : "8+ characters"}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Confirm password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            value={matchPwd}
            error={showMatchError}
            helperText={showMatchError ? "Passwords do not match" : " "}
            onBlur={() => setConfirmTouched(true)}
            onChange={(e) => setMatchPwd(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    fontSize="small"
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={tnc}
                onChange={(e) => setTnc(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                I accept the Terms &amp; Conditions
              </Typography>
            }
            sx={{ userSelect: "none", alignSelf: "flex-start" }}
          />

          {isError && (
            <Alert severity="error" role="alert">
              {errorMsg}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSignUpDisable || isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={17} sx={{ color: "inherit" }} />
              ) : (
                <PersonAddAlt1RoundedIcon />
              )
            }
          >
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 3, textAlign: "center" }}
        >
          Already have an account?{" "}
          <MUILink
            component="button"
            type="button"
            onClick={() => navigate("/login")}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              color: theme.palette.primary.light,
            }}
          >
            Sign in
          </MUILink>
        </Typography>
      </GlassCard>
    </AuthShell>
  );
}

export default SignUp;
