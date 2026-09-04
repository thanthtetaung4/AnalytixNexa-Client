import { useEffect, useState } from "react";
import { Alert, Box, Button } from "@mui/material";

import useWorkspace from "../../components/useWorkspace";
import MyTable from "../../components/MyTable";
import UploadPanel from "../../components/UploadPanel";
import {
  LoadingScreen,
  PageHeader,
  TaskStateDialog,
} from "../../components/ui";

const Files = () => {
  const { files, loading, error, refresh, deleteDatasets } = useWorkspace();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  useEffect(() => {
    uploading && setUploadOpen(true);
  }, [uploading]);

  if (loading) return <LoadingScreen label="Loading files" />;

  const count = files.length;

  return (
    <Box component="section">
      <PageHeader
        title="Dataset library"
        subtitle={
          count > 0
            ? `${count} ${count === 1 ? "file" : "files"} in your library. Select rows to remove them, or upload another CSV.`
            : "Upload the CSV files you want to analyse. They stay in your account until you delete them."
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
          {error.message || "Could not load your library."}
        </Alert>
      )}

      <UploadPanel
        setUploading={setUploading}
        setUploadSuccess={setUploadSuccess}
        setUploadErrorMsg={setUploadErrorMsg}
        defaultOpen={count === 0}
      />

      <MyTable files={files} deleteFiles={deleteDatasets} />

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
    </Box>
  );
};

export default Files;
