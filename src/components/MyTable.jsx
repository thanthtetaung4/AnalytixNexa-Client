import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PropTypes from "prop-types";

import GlassCard from "./ui/GlassCard";
import EmptyState from "./ui/EmptyState";
import { formatBytes, formatDateTime } from "../api/normalize";

/**
 * File library table with multi-select delete.
 *
 * Selection is keyed on the dataset id — the value the API deletes by — so it
 * stays correct when the list reorders and cannot be confused by two files
 * that happen to share a name.
 */
const MyTable = ({ files, deleteFiles }) => {
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const rows = useMemo(
    () => (files ?? []).map((file, index) => ({ ...file, index: index + 1 })),
    [files]
  );

  // drop selections whose file is no longer in the list
  useEffect(() => {
    setSelected((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === rows.length ? [] : rows.map((r) => r.id)
    );

  const handleDelete = async () => {
    const matches = (files ?? []).filter((f) => selected.includes(f.id));
    if (matches.length === 0) return;
    setSelected([]);
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteFiles(matches);
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError(
        error?.message || "Some files could not be deleted. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (rows.length === 0) {
    return (
      <GlassCard padding={{ xs: 2, sm: 3 }}>
        <EmptyState
          icon={<CloudUploadRoundedIcon />}
          title="Your library is empty"
          description="Upload a CSV using the panel above and it will appear here, ready to analyse."
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard padding={0} sx={{ overflow: "hidden" }}>
      {deleteError && (
        <Alert severity="error" role="alert" sx={{ borderRadius: 0 }}>
          {deleteError}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.75,
          borderBottom: `1px solid ${theme.palette.glass.border}`,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontSize: "0.9375rem" }}>
            Uploaded files
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {selected.length > 0
              ? `${selected.length} selected`
              : `${rows.length} ${rows.length === 1 ? "file" : "files"}`}
          </Typography>
        </Box>

        {/* destructive action only appears once a selection exists, and always
            names the count so it can't be triggered blind */}
        {selected.length > 0 && (
          <Button
            onClick={handleDelete}
            variant="outlined"
            color="error"
            size="small"
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
            sx={{
              borderColor: alpha(theme.palette.error.main, 0.4),
              color: theme.palette.error.main,
              "&:hover": {
                borderColor: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            {deleting ? "Deleting…" : `Delete ${selected.length}`}
          </Button>
        )}
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table aria-label="Uploaded files">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={selected.length === rows.length && rows.length > 0}
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  onChange={toggleAll}
                  inputProps={{ "aria-label": "Select all files" }}
                />
              </TableCell>
              <TableCell>#</TableCell>
              <TableCell>File name</TableCell>
              <TableCell align="right">Rows</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.includes(row.id);
              return (
                <TableRow
                  key={row.id}
                  selected={isSelected}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.09),
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => toggle(row.id)}
                      inputProps={{ "aria-label": `Select ${row.name}` }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.disabled" }}>
                    {row.index}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                    >
                      <DescriptionRoundedIcon
                        sx={{ fontSize: 17, color: "text.disabled" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 550, wordBreak: "break-word" }}
                      >
                        {row.name}
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
                    {row.rowCount?.toLocaleString() ?? "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      fontFamily:
                        '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatBytes(row.size)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDateTime(row.createdAt)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={row.available ? "Ready" : "Analysed"}
                      size="small"
                      sx={{
                        color: row.available
                          ? theme.palette.success.main
                          : theme.palette.text.secondary,
                        bgcolor: row.available
                          ? alpha(theme.palette.success.main, 0.12)
                          : theme.palette.glass.surface,
                        borderColor: row.available
                          ? alpha(theme.palette.success.main, 0.28)
                          : theme.palette.glass.border,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
};

MyTable.propTypes = {
  files: PropTypes.array,
  deleteFiles: PropTypes.func,
};

export default MyTable;
