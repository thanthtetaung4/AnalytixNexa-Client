import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/AuthProvider";
import { Box, Typography, Button } from "@mui/material";

const Files = () => {
  const { auth } = useContext(AuthContext);
  const files = auth.userDetails ? auth.userDetails.files : null;
  const [loading, setLoading] = useState(true);
  const deleteFile = auth.deleteFileUserDetails;

  useEffect(() => {
    files && setLoading(false);
  }, [files]);

  let elements = [];
  if (files) {
    for (let i = 0; i < files.length; i++) {
      elements.push(
        <Box key={i}>
          <Typography variant="body">{files[i].name}</Typography>
          <Button onClick={() => deleteFile(files[i], auth.user.uid)}>
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
            Hi
          </Typography>
          {elements}
        </Box>
      )}
    </main>
  );
};

export default Files;
