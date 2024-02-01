import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";

const Verify = () => {
  const navigate = useNavigate();

  return (
    <main>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Paper
          variant="elevation"
          sx={{
            maxWidth: "50vw",
            backgroundColor: "inherit",
            p: "3rem",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" component="h1">
            Please Verify your email!
          </Typography>
          <ErrorIcon sx={{ fontSize: "6rem", mt: "2rem" }} />
          <br />
          <Button variant="contained" onClick={() => navigate("/login")}>
            {/* <Button
            variant="contained"
            onClick={() => {
              redirect("/login");
              console.log("saldkfj;laskkdafjnal;h");
            }}
          > */}
            Go to Login
          </Button>
        </Paper>
      </Box>
    </main>
  );
};

export default Verify;
