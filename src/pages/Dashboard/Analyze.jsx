import { useState, useContext, useEffect } from "react";

import ModalBox from "../../components/ModalBox";
import {
  Box,
  Typography,
  Modal,
  Button,
  IconButton,
  keyframes,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Dropzone from "../../components/DropZone";
import { AuthContext } from "../../components/AuthProvider";
import PaginationTable from "../../components/PaginationTable";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

const Analyze = () => {
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const handleClose = () => setOpen(false);
  const files = auth.userDetails ? auth.userDetails.files : null;
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  useEffect(() => {
    files && setLoading(false);
  }, [files]);

  useEffect(() => {
    uploading && setOpen(true);
  }, [uploading]);

  const toggleShow = () => {
    setIsShow((prev) => !prev);
  };

  const myAnimation = keyframes`
    0%{
      height: 0,
      
    }
    100%{
      height: 100%,
      
    }
  `;

  return (
    <main>
      {loading ? (
        <h1>Loading</h1>
      ) : (
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Analyze
          </Typography>

          <Modal
            open={open}
            onClose={uploading ? () => setOpen(true) : () => handleClose()}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <ModalBox>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 2,
                  backgroundColor: "#233142",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <IconButton
                  onClick={handleClose}
                  sx={{
                    maxWidth: "45px",
                    marginLeft: "auto",
                  }}
                >
                  <Close />
                </IconButton>
                <Box sx={{ width: "200px", height: "100px" }}>
                  <Typography>
                    {uploading
                      ? "Uploading"
                      : uploadSuccess
                      ? "Successfully Uploaded"
                      : "Upload Fail"}
                  </Typography>
                  <Typography>{uploadErrorMsg}</Typography>
                </Box>
              </Box>
            </ModalBox>
          </Modal>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              rowGap: 1,
            }}
          >
            <Button
              onClick={() => toggleShow()}
              variant="outlined"
              startIcon={isShow ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              sx={{
                width: "100%",
              }}
            >
              Upload Area
            </Button>
            <Box
              sx={{
                height: isShow ? "250px" : 0,
                opacity: !isShow ? "0" : "1",
                transition: "ease-in .2s",
                visibility: !isShow ? "hidden" : "visible",
                animation: `${myAnimation}`,
                width: "100%",
              }}
            >
              <Dropzone
                setUploading={setUploading}
                setUploadSuccess={setUploadSuccess}
                setUploadErrorMsg={setUploadErrorMsg}
              />
            </Box>
          </Box>
          <PaginationTable files={auth.userDetails.files} />
        </Box>
      )}
    </main>
  );
};

export default Analyze;