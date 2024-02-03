import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/AuthProvider";
import { Box, Typography, Button } from "@mui/material";
import MyTable from "../../components/MyTable";

const Files = () => {
  const { auth } = useContext(AuthContext);
  const files = auth.userDetails ? auth.userDetails.files : null;
  const [loading, setLoading] = useState(true);

  const deleteFile = auth.deleteFileUserDetails;
  const deleteFiles = auth.deleteMultipleFilesUserDetails;
  // console.log(files);
  // console.log("rendered");
  useEffect(() => {
    files && setLoading(false);
  }, [files]);

  let elements = [];
  if (files) {
    for (let i = 0; i < files.length; i++) {
      // console.log(files[i]);
      elements.push(
        <Box key={i}>
          <Typography variant="body" component="p">
            File Name: {files[i].name}
          </Typography>
          <Typography variant="body" component="p">
            File Size: {files[i].size} bytes
          </Typography>
          <Button variant="contained" onClick={() => deleteFile(files[i])}>
            Delete
          </Button>
        </Box>
      );
    }
  }
  // console.log("Files are:", files, "\n Elements:", elements);
  return (
    <main>
      {loading ? (
        <Typography>Loading</Typography>
      ) : (
        <Box>
          <Typography variant="h4" component="h2">
            Files
          </Typography>

          <MyTable files={files} deleteFiles={deleteFiles} />
        </Box>
      )}
    </main>
  );
};

export default Files;
