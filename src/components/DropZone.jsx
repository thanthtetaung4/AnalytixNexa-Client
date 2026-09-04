import { Box, Button, IconButton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import PropTypes from "prop-types";

import useWorkspace from "./useWorkspace";

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

/**
 * The API's rejections are specific and worth repeating verbatim (which column
 * is missing, what the size limit is); only the vague cases get a fallback.
 */
const uploadMessage = (error) => {
  if (error?.code === "191") {
    return "A file with that name already exists in your library.";
  }
  const surfaced = new Set([
    "unsupported_file",
    "empty_dataset",
    "payload_too_large",
    "validation_error",
    "missing_columns",
    "network_error",
  ]);
  if (surfaced.has(error?.code) && error?.message) return error.message;
  return "The upload did not complete. Please try again.";
};

/**
 * Glass drop target. The border and tint react to drag state (idle / accepted
 * / rejected) so the user gets an answer before releasing the file.
 */
function Dropzone({ setUploading, setUploadSuccess, setUploadErrorMsg }) {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const { uploadDataset } = useWorkspace();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      setLocalError("One file at a time, please.");
      return;
    }
    setLocalError("");
    setFile(acceptedFiles[0]);
  };

  const uploadFileHandler = async () => {
    if (!file) return;
    try {
      setUploading(true);
      await uploadDataset(file);
      setUploadSuccess(true);
      setUploadErrorMsg("");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadSuccess(false);
      setUploadErrorMsg(uploadMessage(error));
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({ onDrop, accept: { "text/csv": [".csv"] }, multiple: false });

  const state = isDragReject ? "reject" : isDragActive ? "active" : "idle";
  const tone = {
    idle: theme.palette.glass.borderStrong,
    active: theme.palette.primary.main,
    reject: theme.palette.error.main,
  }[state];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        {...getRootProps()}
        sx={{
          border: `1.5px dashed ${tone}`,
          borderRadius: 3,
          p: 3,
          minHeight: 190,
          cursor: "pointer",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.25,
          bgcolor:
            state === "idle"
              ? theme.palette.glass.surface
              : alpha(tone, 0.08),
          transition: `all ${theme.motion.base}ms ${theme.motion.ease}`,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          },
        }}
      >
        <input {...getInputProps()} />

        {file ? (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              pr: 5,
              borderRadius: 2,
              maxWidth: "100%",
              bgcolor: theme.palette.glass.surfaceStrong,
              border: `1px solid ${theme.palette.glass.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: theme.palette.success.main,
                bgcolor: alpha(theme.palette.success.main, 0.14),
              }}
            >
              <TableChartRoundedIcon fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {formatSize(file.size)} · ready to upload
              </Typography>
            </Box>
            <IconButton
              onClick={() => setFile(null)}
              aria-label="Remove selected file"
              size="small"
              sx={{ position: "absolute", top: 6, right: 6 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: state === "reject" ? "error.main" : "primary.light",
                background:
                  state === "reject"
                    ? alpha(theme.palette.error.main, 0.14)
                    : theme.gradients.brandSoft,
                border: `1px solid ${theme.palette.glass.border}`,
                "& svg": { fontSize: 23 },
              }}
            >
              <CloudUploadRoundedIcon />
            </Box>
            <Typography variant="subtitle1" sx={{ fontSize: "0.9375rem" }}>
              {state === "reject"
                ? "That file type is not supported"
                : state === "active"
                ? "Release to attach"
                : "Drag a CSV here, or click to browse"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {state === "reject"
                ? "Only .csv files can be analysed"
                : "One .csv file at a time"}
            </Typography>
          </>
        )}
      </Box>

      {localError && (
        <Typography variant="caption" sx={{ color: "error.main" }} role="alert">
          {localError}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        startIcon={<CloudUploadRoundedIcon />}
        onClick={uploadFileHandler}
        disabled={file === null}
      >
        {file ? `Upload ${file.name}` : "Upload"}
      </Button>
    </Box>
  );
}

Dropzone.propTypes = {
  setUploading: PropTypes.func,
  setUploadSuccess: PropTypes.func,
  setUploadErrorMsg: PropTypes.func,
};

export default Dropzone;
