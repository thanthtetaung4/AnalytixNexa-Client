import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FunctionsRoundedIcon from "@mui/icons-material/FunctionsRounded";
import PropTypes from "prop-types";

import GlassCard from "./ui/GlassCard";
import EmptyState from "./ui/EmptyState";
import useProviders from "./useProviders";
import useWorkspace from "./useWorkspace";

const ENGINE_ICON = {
  pandas: <FunctionsRoundedIcon sx={{ fontSize: 16 }} />,
  ai: <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />,
};

const ENGINE_LABEL = { pandas: "Statistics", ai: "AI analyst" };

/**
 * Queue of datasets awaiting analysis, plus the choice of which engine runs them.
 *
 * Pressing Analyze queues a job on the API and polls it to completion — the API
 * answers 202 and runs the work in the background, so there is nothing to read
 * until the job reports back.
 *
 * The engine picker is here rather than in Settings because it is a per-run
 * decision: the statistics engine is right for a standard sales export, and the
 * AI analyst is right for a file with unusual columns or a specific question,
 * which is why the question box only appears alongside it.
 */
const PaginationTable = ({ files, setAnalysing, setAnalyseSuccess, setAnalyseError }) => {
  const { analyzeDataset } = useWorkspace();
  const { runnable, defaultProvider, byName, loading: loadingEngines } = useProviders();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [busyFile, setBusyFile] = useState(null);
  const [engine, setEngine] = useState(null);
  const [question, setQuestion] = useState("");

  // Default to whatever the server defaults to, once we know what that is.
  useEffect(() => {
    if (engine === null && runnable.length > 0) {
      const preferred = runnable.find((p) => p.name === defaultProvider) ?? runnable[0];
      setEngine(preferred.name);
    }
  }, [engine, runnable, defaultProvider]);

  const available = useMemo(() => (files ?? []).filter((file) => file.available), [files]);

  const paged =
    rowsPerPage > 0
      ? available.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : available;

  const aiProvider = byName("ai");
  const aiOffline = Boolean(aiProvider) && !aiProvider.available;
  const isAi = engine === "ai";

  const handleAnalyze = async (file) => {
    setBusyFile(file.id);
    setAnalysing(true);
    setAnalyseSuccess(false);
    setAnalyseError("");
    try {
      await analyzeDataset(file.id, {
        ...(engine ? { provider: engine } : {}),
        // The statistics engine ignores a question; sending it anyway would
        // store text on a job that never reads it.
        ...(isAi && question.trim() ? { question: question.trim() } : {}),
      });
      setAnalyseSuccess(true);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyseSuccess(false);
      setAnalyseError(
        error?.message || "The analysis service could not be reached. Please try again."
      );
    } finally {
      setAnalysing(false);
      setBusyFile(null);
    }
  };

  if (available.length === 0) {
    return (
      <GlassCard padding={{ xs: 2, sm: 3 }}>
        <EmptyState
          icon={<QueryStatsRoundedIcon />}
          title="Nothing queued for analysis"
          description="Upload a CSV using the panel above — every dataset you have not analysed yet shows up here."
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard padding={0} sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.glass.border}`,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: "0.9375rem" }}>
            Ready to analyse
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {available.length} {available.length === 1 ? "dataset" : "datasets"} in the queue
          </Typography>
        </Box>

        {!loadingEngines && runnable.length + (aiOffline ? 1 : 0) > 1 && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={engine}
            onChange={(_, next) => next && setEngine(next)}
            aria-label="Analysis engine"
          >
            {[...runnable, ...(aiOffline ? [aiProvider] : [])].map((provider) => {
              const disabled = !provider.available;
              return (
                <Tooltip
                  key={provider.name}
                  title={
                    disabled
                      ? "The AI engine needs an API key on the server. Ask an administrator to set OPENROUTER_API_KEY."
                      : provider.description || ""
                  }
                >
                  {/* A disabled ToggleButton swallows pointer events, so the
                      span is what carries the tooltip explaining why. */}
                  <Box component="span" sx={{ display: "inline-flex" }}>
                    <ToggleButton
                      value={provider.name}
                      disabled={disabled}
                      sx={{ gap: 0.75, px: 1.5, textTransform: "none" }}
                    >
                      {ENGINE_ICON[provider.name]}
                      {ENGINE_LABEL[provider.name] ?? provider.name}
                    </ToggleButton>
                  </Box>
                </Tooltip>
              );
            })}
          </ToggleButtonGroup>
        )}
      </Box>

      {/* Only the AI engine reads a question, so the field only exists for it. */}
      {isAi && (
        <Box sx={{ px: 2, pt: 1.75, pb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Ask a question about this data (optional)"
            placeholder="Which product should we push next quarter?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            inputProps={{ maxLength: 2000 }}
            helperText="The analyst inspects your columns, decides which analyses fit, runs them, then writes up what it found."
          />
        </Box>
      )}

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table aria-label="Datasets available to analyse">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>File name</TableCell>
              <TableCell align="right">Rows</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((file, index) => {
              const busy = busyFile === file.id;
              return (
                <TableRow key={file.id}>
                  <TableCell sx={{ color: "text.disabled" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <DescriptionRoundedIcon
                        sx={{ fontSize: 17, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 550, wordBreak: "break-word" }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "text.secondary",
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.rowCount?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      disabled={busyFile !== null}
                      onClick={() => handleAnalyze(file)}
                      startIcon={
                        busy ? (
                          <CircularProgress size={14} sx={{ color: "inherit" }} />
                        ) : (
                          ENGINE_ICON[engine] ?? <QueryStatsRoundedIcon />
                        )
                      }
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {busy ? "Analysing…" : "Analyze"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        component="div"
        count={available.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </GlassCard>
  );
};

PaginationTable.propTypes = {
  files: PropTypes.array,
  setAnalysing: PropTypes.func,
  setAnalyseSuccess: PropTypes.func,
  setAnalyseError: PropTypes.func,
};

export default PaginationTable;
