import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import useAuth from "../../components/useAuth";
import useWorkspace from "../../components/useWorkspace";
import { formatBytes, reportMetrics } from "../../api/normalize";
import ResultPanel from "../../components/ResultPanel";
import {
  EmptyState,
  GlassCard,
  LoadingScreen,
  MetricStrip,
  PageHeader,
} from "../../components/ui";

/** How many files the sidebar list shows before it defers to the Files page. */
const FILE_PREVIEW = 5;

/**
 * The Overview page.
 *
 * It used to carry a masthead, four KPI cards, the full latest analysis, a
 * quick-actions card and a file list — five competing blocks, of which two were
 * pure navigation duplicating the sidebar. It is three now: the numbers, the
 * latest analysis, and the library. Quick actions are gone; every one of them
 * was a link the sidebar already had, and the one that was not (run an
 * analysis) is the page's single primary button.
 */
function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const { files, results, latest, readyCount, loading, error, refresh } = useWorkspace();

  const metrics = useMemo(() => {
    const report = reportMetrics(latest?.report);
    return [
      {
        label: "Datasets",
        value: files.length,
        caption: readyCount > 0 ? `${readyCount} not yet analysed` : "all analysed",
        icon: <FolderRoundedIcon />,
        accent: theme.palette.primary.main,
      },
      {
        label: "Analyses",
        value: results.length,
        caption: "saved to your account",
        icon: <InsightsRoundedIcon />,
        accent: theme.palette.secondary.main,
      },
      {
        label: "Customers",
        value: report.uniqueCustomers,
        caption: "in your latest result",
        icon: <GroupsRoundedIcon />,
        accent: theme.palette.info.main,
      },
      {
        label: "Total sales",
        value: report.totalSale,
        decimals: 2,
        caption: "in your latest result",
        icon: <PaymentsRoundedIcon />,
        accent: theme.palette.success.main,
      },
    ];
  }, [files.length, results.length, readyCount, latest, theme.palette]);

  const firstName = (user?.full_name || user?.email || "there").split(/[\s@]/)[0];

  if (loading) return <LoadingScreen label="Loading workspace" />;

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Your latest analysis and everything waiting to be processed."
        action={
          <Button
            component={RouterLink}
            to="/dashboard/analyze"
            variant="contained"
            startIcon={<QueryStatsRoundedIcon />}
          >
            Run an analysis
          </Button>
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
          {error.message || "Could not load your workspace."}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <MetricStrip metrics={metrics} delay={0} />
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <GlassCard padding={{ xs: 1.75, sm: 2.25 }} delay={80}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 2,
                mb: 1.5,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Latest analysis
              </Typography>
              {results.length > 1 && (
                <Button
                  component={RouterLink}
                  to="/dashboard/result"
                  variant="text"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  All {results.length}
                </Button>
              )}
            </Box>

            {latest ? (
              // `compact` drops the deep write-up and the audit trail — both
              // belong on the Results page, where the analysis is the subject.
              <ResultPanel result={latest} defaultExpanded compact />
            ) : (
              <EmptyState
                icon={<QueryStatsRoundedIcon />}
                title="No analysis yet"
                description="Upload a CSV of your sales data and run it through an analysis engine — results appear here."
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
            )}
          </GlassCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <GlassCard padding={{ xs: 1.75, sm: 2.25 }} delay={140}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 2,
                mb: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Your files
              </Typography>
              <Button
                component={RouterLink}
                to="/dashboard/files"
                variant="text"
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Manage
              </Button>
            </Box>

            {files.length > 0 ? (
              <Box>
                {files.slice(0, FILE_PREVIEW).map((file) => (
                  <Box
                    key={file.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      py: 0.875,
                    }}
                  >
                    <DescriptionRoundedIcon
                      sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        {formatBytes(file.size)}
                        {file.rowCount !== undefined &&
                          ` · ${file.rowCount.toLocaleString()} rows`}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {files.length > FILE_PREVIEW && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", display: "block", pt: 0.5 }}
                  >
                    +{files.length - FILE_PREVIEW} more
                  </Typography>
                )}
              </Box>
            ) : (
              <EmptyState
                icon={<CloudUploadRoundedIcon />}
                title="No files yet"
                description="Drop a CSV to get started."
                action={
                  <Button
                    component={RouterLink}
                    to="/dashboard/files"
                    variant="outlined"
                    startIcon={<CloudUploadRoundedIcon />}
                  >
                    Upload a file
                  </Button>
                }
                sx={{ py: 3 }}
              />
            )}
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
