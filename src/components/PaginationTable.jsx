import {
  Table,
  TablePagination,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Button,
} from "@mui/material";
import { useState } from "react";
import PropTypes from "prop-types";

const PaginationTable = ({ files }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rows =
    files.length > 0 ? (
      files.map(
        (file, index) =>
          file.available && (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{file.name}</TableCell>
              <TableCell align="right">
                <Button onClick={() => console.log(file)}>Analyze</Button>
              </TableCell>
            </TableRow>
          )
      )
    ) : (
      <TableRow>
        <TableCell colSpan={3} align="center">
          No data available to analyze yet. <br /> Upload to see available
          dataset.
        </TableCell>
      </TableRow>
    );
  return (
    <>
      <Table sx={{ p: 5 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "1.2rem" }}>ID</TableCell>
            <TableCell sx={{ fontSize: "1.2rem" }}>Name</TableCell>
            <TableCell align="right" sx={{ fontSize: "1.2rem" }}>
              Analyze
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
        component="div"
        count={1}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        colSpan={3}
        sx={{ p: 5 }}
      />
    </>
  );
};

PaginationTable.propTypes = {
  files: PropTypes.array,
};

export default PaginationTable;
