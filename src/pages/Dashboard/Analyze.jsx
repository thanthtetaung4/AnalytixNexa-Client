import { useState, useContext } from "react";

import ModalBox from "../../components/ModalBox";
import { Box, Typography, Modal, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import Dropzone from "../../components/DropZone";
import { AuthContext } from "../../components/AuthProvider";

const Analyze = () => {
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <main>
      <Box>
        <Typography variant="h4">Analyze</Typography>

        <Button onClick={handleOpen} variant="contained">
          Upload File
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <ModalBox>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
              }}
            >
              <IconButton
                onClick={handleClose}
                sx={{
                  maxWidth: "45px",
                  marginLeft: "auto",
                  backgroundColor: "#6daed6",
                }}
              >
                <Close />
              </IconButton>
              <Dropzone />
            </Box>
          </ModalBox>
        </Modal>
      </Box>
    </main>
  );
};

export default Analyze;
