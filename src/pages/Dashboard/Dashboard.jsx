import "../../components/AuthProvider";
import { Paper, Box, Typography, Grid } from "@mui/material";

import { useMediaQuery, useTheme } from "@mui/material";
import { AuthContext } from "../../components/AuthProvider";
import { useContext, useEffect, useState } from "react";

import { auth as firebaseAuth } from "../../components/firebase";

function Dashboard() {
  const { auth } = useContext(AuthContext);
  const theme = useTheme();
  const user = auth.user;
  const [isLoading, setIsLoading] = useState(true);
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    firebaseAuth.currentUser !== null
      ? setIsLoading(false)
      : setIsLoading(true);
  }, [auth]);

  console.log("From Dashboard", user);

  return (
    <>
      {isLoading ? (
        <h1>Loading</h1>
      ) : (
        isDesktop && (
          <Box component="div">
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography variant="h4" component="h1" sx={{ p: 2 }}>
                  Welcome back {user.displayName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{ p: 5, background: "red" }}
                  component="div"
                >
                  <Typography variant="h5" component="h2">
                    Recent Results
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 5 }} component="div">
                  <Typography variant="h5" component="h2">
                    Files
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )
      )}
    </>
  );
}

export default Dashboard;
