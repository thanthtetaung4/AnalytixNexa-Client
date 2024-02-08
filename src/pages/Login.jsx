import {
  Alert,
  Box,
  useTheme,
  useMediaQuery,
  Grid,
  Typography,
  TextField,
  Button,
  Checkbox,
  Link as MUILink,
  FormControlLabel,
  Divider,
  CircularProgress,
  Modal,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import poster from "../assets/poster-img.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../components/useAuth";
import ModalBox from "../components/ModalBox";

const Login = () => {
  const theme = useTheme();
  const [successfulLogin, setSuccessfulLogin] = useState(false);
  const [isRemember, setIsRemember] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLogInError, setLogInError] = useState(false);
  const [credential, setCredential] = useState({ email: "", pwd: "" });
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  console.log(theme.palette.text.primary);

  const navigate = useNavigate();
  useEffect(() => {
    successfulLogin && navigate("/dashboard");
  }, [successfulLogin, navigate]);

  const handleEmailChange = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
    setIsEmailValid(emailRegex.test(email));
    setCredential((prev) => ({ ...prev, email: email }));
  };

  const handlePwdChange = (pwd) => {
    setCredential((prev) => ({ ...prev, pwd: pwd }));
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await login(credential.email, credential.pwd, isRemember);
      setLoading(false);
      setSuccessfulLogin(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setLogInError(true);
    }
  };

  const handleRemember = (remember) => {
    remember && setIsRemember(true);
  };

  const handleGoogleSingIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      setSuccessfulLogin(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setLogInError(true);
      console.error(error); // Handle login errors
    }
  };

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {useMediaQuery(theme.breakpoints.up("lg")) && (
        <Grid
          item
          sx={{
            height: "100%",
          }}
          xs="4"
        >
          <img
            src={poster}
            alt=""
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </Grid>
      )}
      <Grid item sx={{}} xs>
        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
            px: {
              lg: 20,
              md: 40,
              sm: 20,
              xs: 10,
            },
            py: 10,
          }}
        >
          <Typography variant="h2" component="h1">
            Sign In
          </Typography>
          <TextField
            error={!isEmailValid}
            helperText={!isEmailValid ? "Incorrect Email" : ""}
            label="Email"
            type="email"
            onChange={(e) => handleEmailChange(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            onChange={(e) => handlePwdChange(e.target.value)}
            onKeyDown={(e) => {
              e.key === "Enter" && handleSignIn();
            }}
          />
          {isLogInError && (
            <Alert severity="error">Invalid Email or Password</Alert>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: theme.palette.text.primary,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox onChange={(e) => handleRemember(e.target.checked)} />
              }
              label="Remember Me"
              sx={{ userSelect: "none" }}
            />
          </Box>
          <Button variant="contained" onClick={handleSignIn}>
            Sign In
          </Button>
          <Divider>OR</Divider>
          <Button variant="contained" onClick={handleGoogleSingIn}>
            Sign In with Google <GoogleIcon sx={{ ml: 1 }} />
          </Button>
          <MUILink
            sx={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => navigate("/signup")}
          >
            Don&apos;t have an Account? Sing up now.
          </MUILink>
          <Modal open={loading}>
            <ModalBox
              sx={{
                "&:focus": {
                  outline: "none",
                },
              }}
            >
              <CircularProgress />
            </ModalBox>
          </Modal>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
