import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../components/AuthProvider";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MyChart from "../../components/MyChart";
import TemporalChart from "../../components/TemporalChart";

const Result = () => {
  const { auth } = useContext(AuthContext);
  const results = auth.userDetails ? auth.userDetails.results : null;
  const [loading, setLoading] = useState(true);
  const analtixRef = useRef();

  useEffect(() => {
    results && setLoading(false);
  }, [results]);

  const resultElements = results?.map((result) => (
    <Box key={result.fileName} sx={{ mb: 1, width: "100%", overflowX: "none" }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Result of file: {result.fileName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box id="analytix" ref={analtixRef} sx={{ color: "#6DAED6" }}>
            <Box sx={{ p: 1 }}>
              <Typography variant="h5">Customer Behaviors Analysis</Typography>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {result.temporal_analysis.temporal_analysis.map((data) => (
                <Box
                  key={data.month}
                  sx={{
                    width: "90%",
                  }}
                  component={"div"}
                >
                  <TemporalChart analysisData={data} key={data.month} />
                </Box>
              ))}
              <Box
                sx={{
                  width: "90%",
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
    </Box>
  ));

  return (
    <Box component={"main"} sx={{ overflowX: "none" }}>
      {loading ? (
        <Box>
          <Typography variant="h4">Loading...</Typography>
        </Box>
      ) : (
        <Box width={"100%"}>
          <Typography variant="h4">Result</Typography>
          {resultElements}
        </Box>
      )}
    </Box>
  );
};

export default Result;
