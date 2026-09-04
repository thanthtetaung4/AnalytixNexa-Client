import { useState } from "react";
import { Alert, Box, Button, Collapse, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PropTypes from "prop-types";

import Dropzone from "./DropZone";
import GlassCard from "./ui/GlassCard";

const REQUIRED_COLUMNS = [
  "product",
  "category",
  "unit_price",
  "sale",
  "customer",
  "date",
];

/** Shipped with the client (public/), so the example never depends on a
 *  network round trip or on the API being reachable. */
const DEMO_FILE = "sample-dataset.csv";

/**
 * The upload affordance, shared by Analyze and Files (both pages previously
 * carried their own copy of this block plus the demo-download handler).
 *
 * The schema requirement is stated up front as named column chips rather than
 * buried in a sentence, and the example file is one click away — the two
 * things that stop a failed upload before it happens.
 */
const UploadPanel = ({
  setUploading,
  setUploadSuccess,
  setUploadErrorMsg,
  defaultOpen = false,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <GlassCard padding={{ xs: 2, sm: 2.5 }} sx={{ mb: 2 }}>
      {/* Downgraded from a warning to information, because it is no longer a
          hard requirement: the statistics engine needs these exact names, but
          the AI analyst reads whatever columns your export happens to have. */}
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button
            component="a"
            href={`/${DEMO_FILE}`}
            download={DEMO_FILE}
            size="small"
            color="inherit"
            startIcon={<DownloadRoundedIcon fontSize="small" />}
            sx={{ whiteSpace: "nowrap" }}
          >
            Example
          </Button>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
          Upload a CSV. The statistics engine expects these columns
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {REQUIRED_COLUMNS.map((col) => (
            <Box
              key={col}
              component="code"
              sx={{
                px: 0.875,
                py: 0.25,
                borderRadius: 1,
                fontFamily:
                  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: "0.75rem",
                color: "inherit",
                bgcolor: `${theme.palette.info.main}1F`,
                border: `1px solid ${theme.palette.info.main}33`,
              }}
            >
              {col}
            </Box>
          ))}
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
          Different column names? Pick the AI analyst below — it works out which
          columns mean what.
        </Typography>
      </Alert>

      <Button
        onClick={() => setOpen((prev) => !prev)}
        variant="outlined"
        fullWidth
        aria-expanded={open}
        aria-controls="upload-dropzone"
        startIcon={<CloudUploadRoundedIcon />}
        endIcon={
          <ExpandMoreRoundedIcon
            sx={{
              transform: open ? "rotate(180deg)" : "none",
              transition: `transform ${theme.motion.base}ms ${theme.motion.ease}`,
            }}
          />
        }
        sx={{ justifyContent: "space-between" }}
      >
        {open ? "Hide upload area" : "Upload a dataset"}
      </Button>

      <Collapse in={open} timeout={260} unmountOnExit>
        <Box id="upload-dropzone" sx={{ pt: 2 }}>
          <Dropzone
            setUploading={setUploading}
            setUploadSuccess={setUploadSuccess}
            setUploadErrorMsg={setUploadErrorMsg}
          />
        </Box>
      </Collapse>
    </GlassCard>
  );
};

UploadPanel.propTypes = {
  setUploading: PropTypes.func.isRequired,
  setUploadSuccess: PropTypes.func.isRequired,
  setUploadErrorMsg: PropTypes.func.isRequired,
  defaultOpen: PropTypes.bool,
};

export default UploadPanel;
