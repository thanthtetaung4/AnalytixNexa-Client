import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button } from "@mui/material";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

import useWorkspace from "../../components/useWorkspace";
import ResultPanel from "../../components/ResultPanel";
import {
  EmptyState,
  GlassCard,
  LoadingScreen,
  PageHeader,
} from "../../components/ui";

const Result = () => {
  const { results, loading, error, refresh } = useWorkspace();

  if (loading) return <LoadingScreen label="Loading results" />;

  return (
    <Box component="section">
      <PageHeader
        title="Analysis history"
        subtitle={
          results.length > 0
            ? `${results.length} saved ${
                results.length === 1 ? "analysis" : "analyses"
              }, newest first. Expand any file to see its full breakdown.`
            : "Every analysis you run is saved here."
        }
        action={
          results.length > 0 && (
            <Button
              component={RouterLink}
              to="/dashboard/analyze"
              variant="contained"
              startIcon={<QueryStatsRoundedIcon />}
            >
              New analysis
            </Button>
          )
        }
      />

      {error && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refresh()}>
              Retry
            </Button>
          }
        >
          {error.message || "Could not load your results."}
        </Alert>
      )}

      {results.length > 0 ? (
        // the API returns jobs newest first, so the list order is already right
        results.map((result, i) => (
          <ResultPanel
            key={result.id}
            result={result}
            defaultExpanded={i === 0}
            delay={i * 70}
          />
        ))
      ) : (
        <GlassCard padding={{ xs: 2, sm: 3 }}>
          <EmptyState
            icon={<InsightsRoundedIcon />}
            title="No results yet"
            description="Once you analyse a dataset, its customer, sales and temporal breakdowns will be listed here."
            action={
              <Button
                component={RouterLink}
                to="/dashboard/analyze"
                variant="contained"
                startIcon={<QueryStatsRoundedIcon />}
              >
                Analyse a dataset
              </Button>
            }
          />
        </GlassCard>
      )}
    </Box>
  );
};

export default Result;
