import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import { useState } from "react";
import { updateProfile } from "firebase/auth";
import useAuth from "../../components/useAuth";

const Account = () => {
  const [newName, setNewName] = useState("");
  const { user, handlePwdReset } = useAuth();

  const handleNameChange = async () => {
    await updateProfile(user, {
      displayName: newName,
    }).then(() => console.log("User successfully updated!"));
  };

  return (
    <main>
      <Container
        sx={{
          height: "100vh",
        }}
      >
        <Box
          sx={{
            height: "80vh",
          }}
        >
          <Typography variant="h5" component="h1">
            Account
          </Typography>
          <Box
            sx={{
              height: "100%",
              p: 4,
              mt: 2,
            }}
            component="form"
          >
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Change your user details
            </Typography>

            <Table size="large">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: "none" }}>
                    <Typography variant="body" component="h3">
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ border: "none" }}>
                    <TextField
                      placeholder="Enter your new name"
                      type="text"
                      variant="standard"
                      value={newName}
                      sx={{
                        width: "50%",
                      }}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="right" colSpan={2}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ mr: 17 }}
                      onClick={handleNameChange}
                    >
                      Change Name
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ border: "none" }}>
                  <TableCell>
                    <Typography variant="body" component="h3">
                      Password
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ mr: 17 }}
                      onClick={handlePwdReset}
                    >
                      Send Password Reset Email
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Container>
    </main>
  );
};

export default Account;
