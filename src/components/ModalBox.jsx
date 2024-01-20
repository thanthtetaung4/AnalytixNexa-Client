import { styled, Box } from "@mui/material";

const ModalBox = styled(Box)(() => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: 5,
  boxShadow: 24,
  textAlign: "center",
  gap: 20,
}));

export default ModalBox;
