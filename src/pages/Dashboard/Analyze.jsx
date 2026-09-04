import { useEffect, useState } from "react";
import { Alert, Box, Button } from "@mui/material";

import useWorkspace from "../../components/useWorkspace";
import UploadPanel from "../../components/UploadPanel";
import PaginationTable from "../../components/PaginationTable";
import {
  LoadingScreen,
  PageHeader,
  TaskStateDialog,
} from "../../components/ui";

const Analyze = () => {
  const { files, readyCount, loading, error, refresh } = useWorkspace();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  const [analyseOpen, setAnalyseOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analyseSuccess, setAnalyseSuccess] = useState(false);
  const [analyseError, setAnalyseError] = useState("");

  useEffect(() => {
    uploading && setUploadOpen(true);
  }, [uploading]);

  useEffect(() => {
    analysing && setAnalyseOpen(true);
  }, [analysing]);

  if (loading) return <LoadingScreen label="Loading datasets" />;

  return (
    <Box component="section">
      <PageHeader
        title="Run an analysis"
        subtitle={
          readyCount > 0
            ? `${readyCount} ${
                readyCount === 1 ? "dataset is" : "datasets are"
              } ready. Choose an engine, then pick a file.`
            : "Upload a CSV of your sales data to generate customer, sales and temporal breakdowns."
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
          {error.message || "Could not load your datasets."}
        </Alert>
      )}

      <UploadPanel
        setUploading={setUploading}
        setUploadSuccess={setUploadSuccess}
        setUploadErrorMsg={setUploadErrorMsg}
        defaultOpen={readyCount === 0}
      />

      <PaginationTable
        files={files}
        setAnalysing={setAnalysing}
        setAnalyseSuccess={setAnalyseSuccess}
        setAnalyseError={setAnalyseError}
      />

      <TaskStateDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        running={uploading}
        success={uploadSuccess}
        errorMessage={uploadErrorMsg}
        runningTitle="Uploading dataset"
        runningBody="Sending your file to secure storage — keep this tab open."
        successTitle="Upload complete"
        successBody="Your dataset is in your library and ready to analyse."
        failTitle="Upload failed"
      />

      <TaskStateDialog
        open={analyseOpen}
        onClose={() => setAnalyseOpen(false)}
        running={analysing}
        success={analyseSuccess}
        errorMessage={analyseError}
        runningTitle="Analysing dataset"
        runningBody="The job is queued on the analysis engine. The statistics engine returns in seconds; the AI analyst inspects your columns and runs several rounds of analysis, which can take a couple of minutes. Keep this tab open."
        successTitle="Analysis complete"
        successBody="Your result is saved — open the Results page to explore it."
        failTitle="Analysis failed"
      />
    </Box>
  );
};

export default Analyze;
