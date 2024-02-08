import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  Link as MUILink,
  FormControlLabel,
  CircularProgress,
  Modal,
  Alert,
  useTheme,
} from "@mui/material";
import useAuth from "../components/useAuth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalBox from "../components/ModalBox";

function SignUp() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [matchPwd, setMatchPwd] = useState("");
  const [tnc, setTnc] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPwdMatch, setIsPwdMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpDisable, setIsSignUpDisable] = useState(true);
  const [isSuccessfulSignUp, setIsSuccessfulSignUp] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const theme = useTheme();

  const { signup } = useAuth();

  let firstName = useRef();
  let lastName = useRef();

  const navigate = useNavigate();
  useEffect(() => {
    isSuccessfulSignUp && navigate("/dashboard");
  }, [isSuccessfulSignUp, navigate]);

  //log testing area

  useEffect(() => {
    email !== "" &&
    firstName !== "" &&
    lastName !== "" &&
    pwd !== "" &&
    isEmailValid &&
    isPwdMatch &&
    tnc
      ? setIsSignUpDisable(false)
      : setIsSignUpDisable(true);
  }, [email, pwd, isEmailValid, isPwdMatch, tnc, firstName, lastName]);

  useEffect(() => {
    pwd == matchPwd ? setIsPwdMatch(true) : setIsPwdMatch(false);
  }, [matchPwd]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEmailChange = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
    setIsEmailValid(emailRegex.test(email));
    setEmail(email);
  };

  const handlePwdChange = (pwd) => {
    setPwd(pwd);
  };

  const handleMatchPwdChange = (inputPwd) => {
    setMatchPwd(inputPwd);
  };

  const toggleTnc = () => {
    setTnc((prev) => !prev);
  };

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      await signup(firstName + lastName, email, pwd);
      setIsLoading(false);
      setIsSuccessfulSignUp(true);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setIsSuccessfulSignUp(false);

      console.error("Signup Error:", error.code, error.message);

      // Map Firebase error codes to custom error messages

      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMsg("Email is already in use. Please use a different email.");
          break;
        case "auth/weak-password":
          setErrorMsg("Password must be at least 6 characters");
          break;
        // Add more cases as needed for other error codes
        default:
          setErrorMsg("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <Container>
      <Box
        component="form"
        sx={{
          border: 1,
          borderRadius: 2,
          p: 5,
          m: 10,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          gap: 5,
          maxWidth: 700,
        }}
      >
        <Typography variant="h2" component="h1">
          Register
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr  1fr",
            gap: 2,
          }}
        >
          <TextField
            label="First Name"
            type="text"
            onChange={(e) => (firstName = e.target.value)}
          />
          <TextField
            label="Last Name"
            type="text"
            onChange={(e) => (lastName = e.target.value)}
          />
        </Box>

        <TextField
          error={!isEmailValid}
          helperText={!isEmailValid ? "Incorrect Email" : ""}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          value={pwd}
          onChange={(e) => handlePwdChange(e.target.value)}
        />

        <TextField
          error={!isPwdMatch}
          helperText={!isPwdMatch ? "Password not match" : ""}
          label="Confirm Password"
          type="password"
          value={matchPwd}
          onChange={(e) => handleMatchPwdChange(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" && handleSignUp();
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                value={tnc}
                onChange={(e) => toggleTnc(e.target.checked)}
              />
            }
            label="Accept Terms & Conditions"
            sx={{ userSelect: "none" }}
          />
        </Box>
        {isError && <Alert severity="error">{errorMsg}</Alert>}
        <Button
          variant="contained"
          onClick={handleSignUp}
          disabled={isSignUpDisable}
        >
          Sign Up
        </Button>
        <MUILink
          sx={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => navigate("/login")}
        >
          Already have an Account? Login here.
        </MUILink>
        <Modal open={isLoading}>
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
    </Container>
  );
}

export default SignUp;
