import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

const MyTable = ({ files, deleteFiles }) => {
  const [data, setData] = useState(
    files ? files.map((file, index) => ({ id: index + 1, ...file })) : []
  );

  const [checkedItems, setCheckedItems] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState([]);
  console.log(filesToDelete);

  const handleCheckboxChange = (event) => {
    const { checked, value } = event.target;
    const fileId = parseInt(value, 10);

    setCheckedItems((prevCheckedItems) =>
      checked
        ? [...prevCheckedItems, fileId]
        : prevCheckedItems.filter((item) => item !== fileId)
    );

    setFilesToDelete((prevFilesToDelete) =>
      checked
        ? [...prevFilesToDelete, { ...data.find((item) => item.id === fileId) }]
        : prevFilesToDelete.filter((item) => item.id !== fileId)
    );
  };

  useEffect(() => {
    setData(files.map((file, index) => ({ id: index + 1, ...file })));
  }, [files]);

  useEffect(() => {
    setIsDeleteMode(checkedItems.length > 0);
  }, [checkedItems]);

  const handleDeleteRows = async () => {
    setData((prevData) =>
      prevData.filter((item) => !checkedItems.includes(item.id))
    );
    const matches = [];

    // Loop through each object in array B
    files.forEach((objB) => {
      // Check if the name of the object in B exists in any object in A
      if (filesToDelete.some((objA) => objA.name === objB.name)) {
        // If a match is found, push the object from B into the matches array
        matches.push(objB);
      }
    });
    console.log("matches", matches);

    deleteFiles(matches);
    setFilesToDelete([]);
    setCheckedItems([]);
    setIsDeleteMode(false);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              {isDeleteMode ? (
                <DeleteIcon onClick={handleDeleteRows} />
              ) : (
                "Files"
              )}
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    //   checked={checkedItems.includes(row.id)}
                    onChange={handleCheckboxChange}
                    value={row.id}
                  />
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No files
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

MyTable.propTypes = {
  files: PropTypes.array,
  deleteFiles: PropTypes.func,
};

export default MyTable;
