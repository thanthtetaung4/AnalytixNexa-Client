import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import { useState, useContext } from "react";
import { useDropzone } from "react-dropzone";
import csvImg from "../assets/csv-file.svg";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AuthContext } from "./AuthProvider";

function Dropzone() {
  const [file, setFile] = useState(null);
  const { auth } = useContext(AuthContext);

  console.log(auth.uploadFile);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      alert("Please drop only one CSV file.");
      return;
    }

    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        csv: [".csv"],
      },
    });

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <>
      <Box
        {...getRootProps()}
        className="dropzone"
        sx={{
          border: "2px dashed white",
          p: 2,
          borderRadius: 2,
          textAlign: "center",
          width: "500px",
          height: "200px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the CSV file here...</Typography>
        ) : isDragReject ? (
          <Typography>Invalid file type. Please drop a CSV file.</Typography>
        ) : (
          !file && (
            <Typography>
              Drag and drop a CSV file, or click to select one
            </Typography>
          )
        )}
        {file && (
          <Card
            className="dropped-file"
            sx={{
              backgroundColor: "inherit",
              position: "relative",
              display: "flex",
            }}
          >
            <CardContent>
              <img src={csvImg} alt="" style={{ width: "50px" }} />
              <Typography component="p">{file.name}</Typography>
            </CardContent>
            <CardActions>
              <CloseIcon
                onClick={handleRemoveFile}
                sx={{ position: "absolute", top: 5, right: 10 }}
              />
            </CardActions>
          </Card>
        )}
      </Box>
      <Button
        variant="contained"
        startIcon={<CloudUploadIcon />}
        onClick={() => auth.uploadFile(file)}
        disabled={file === null ? true : false}
      >
        Upload
      </Button>
    </>
  );
}

export default Dropzone;
