import "../../components/AuthProvider";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import { useMediaQuery, useTheme } from "@mui/material";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MyChart from "../../components/MyChart";
import TemporalChart from "../../components/TemporalChart";
import { AuthContext } from "../../components/AuthProvider";
import { useContext, useEffect, useState } from "react";

import { auth as firebaseAuth } from "../../components/firebase";

function Dashboard() {
  const { auth } = useContext(AuthContext);
  const theme = useTheme();
  const user = auth.user;
  const userDetails = auth.userDetails;
  const [result, setResult] = useState(
    userDetails !== null
      ? userDetails.results.length > 0
        ? userDetails.results[userDetails.results.length - 1]
        : undefined
      : undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    firebaseAuth.currentUser !== null
      ? setIsLoading(false)
      : setIsLoading(true);

    userDetails !== null
      ? userDetails.results.length > 0
        ? setResult(userDetails.results[userDetails.results.length - 1])
        : undefined
      : undefined;
  }, [auth, userDetails]);

  // console.log("From Dashboard", user);
  console.log("result is", result);

  const fileElements = userDetails?.files.map((file) => (
    <Typography key={file.name}>{file.name}</Typography>
  ));

  const resultElements = userDetails && (
    <Box key={result?.fileName} sx={{ mb: 1, width: "100%" }}>
      {result ? (
        <Accordion>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography>Result of file: {result.fileName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box id="analytix" sx={{ color: "#6DAED6" }}>
              <Box sx={{ p: 1 }}>
                <Typography variant="h5">
                  Customer Behaviors Analysis
                </Typography>
                <Typography>
                  Unique Customer:
                  {result.customer_behavior_analysis.unique_customer}
                </Typography>
              </Box>
              <Box sx={{ p: 1 }}>
                <Typography variant="h5">Sales</Typography>
                <Typography>
                  Average Sale: {result.sale_analysis.average_sale}
                </Typography>
                <Typography>
                  Total Sale: {result.sale_analysis.total_sale}
                </Typography>
              </Box>
              <Box sx={{}}>
                {result.temporal_analysis.temporal_analysis.map((data) => (
                  <Box
                    key={data.month}
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    component={"div"}
                  >
                    <TemporalChart analysisData={data} key={data.month} />
                  </Box>
                ))}
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                  component={"div"}
                >
                  <MyChart
                    analysisData={
                      result.product_preference_analysis.product_count
                    }
                  />
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Typography> No result to show analyze now!</Typography>
      )}
    </Box>
  );

  return (
    <>
      {isLoading ? (
        <h1>Loading</h1>
      ) : (
        isDesktop && (
          <Box component="div">
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h4" component="h1" sx={{ p: 2 }}>
                  Welcome {user.displayName}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Paper
                  elevation={0}
                  sx={{ p: 5, backgroundColor: "#6DAED6" }}
                  component="div"
                >
                  <Typography variant="h5" component="h2">
                    Recent Results
                  </Typography>
                  {resultElements}
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper
                  elevation={0}
                  sx={{ p: 5, backgroundColor: "#6DAED6" }}
                  component="div"
                >
                  <Typography variant="h5" component="h2">
                    Files
                  </Typography>
                  {fileElements?.length > 0 ? (
                    fileElements
                  ) : (
                    <Typography>No file to show upload now!</Typography>
                  )}
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
