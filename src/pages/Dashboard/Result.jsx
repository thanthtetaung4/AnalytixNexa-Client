import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/AuthProvider";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Result = () => {
  const { auth } = useContext(AuthContext);
  const results = auth.userDetails ? auth.userDetails.results : null;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    results && setLoading(false);
  }, [results]);

  const resultElements = results?.map((result) => (
    <Box key={result.fileName} sx={{ mb: 1 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Result of file: {result.fileName}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Sale Analysis: {result.sale_analysis.total_sale}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  ));

  return (
    <main>
      {loading ? (
        <Box>
          <Typography variant="h4">Loading...</Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4">Result</Typography>
          {resultElements}
        </Box>
      )}
    </main>
  );
};

export default Result;
