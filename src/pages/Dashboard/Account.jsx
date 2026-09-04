import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import PropTypes from "prop-types";

import useAuth from "../../components/useAuth";
import { emailMyResetLink } from "../../api/auth";
import { formatDateTime } from "../../api/normalize";
import { GlassCard, PageHeader } from "../../components/ui";

const PWD_MIN_LENGTH = 8;
const isPwdMixed = (pwd) => !/^\d+$/.test(pwd) && !/^[A-Za-z]+$/.test(pwd);

/** One labelled settings row: description on the left, control on the right. */
const SettingRow = ({ icon, title, description, children }) => {
  const theme = useTheme();
  return (
    <Grid container spacing={2} alignItems="center" sx={{ py: 2.5 }}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", pr: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: "primary.light",
              background: theme.gradients.brandSoft,
              border: `1px solid ${theme.palette.glass.border}`,
              "& svg": { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontSize: "0.9375rem" }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{ display: "flex", justifyContent: { md: "flex-end" } }}
      >
        {children}
      </Grid>
    </Grid>
  );
};

SettingRow.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
};

const Account = () => {
  const navigate = useNavigate();
  const { user, updateName, updatePassword } = useAuth();

  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [notice, setNotice] = useState(null);

  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [emailingLink, setEmailingLink] = useState(false);

  const handleNameChange = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNotice(null);
    setSavingName(true);
    try {
      await updateName(trimmed);
      setNewName("");
      setNotice({ severity: "success", text: `Your name is now “${trimmed}”.` });
    } catch (error) {
      console.error("Profile update failed:", error);
      setNotice({
        severity: "error",
        text: error?.message || "Could not update your name. Please try again.",
      });
    } finally {
      setSavingName(false);
    }
  };

  // The route for someone who cannot remember the current password: prove
  // ownership of the inbox instead. The bearer token already proves the account
  // is theirs, so this endpoint may confirm the address it sent to.
  const handleEmailLink = async () => {
    setNotice(null);
    setEmailingLink(true);
    try {
      const { message } = await emailMyResetLink();
      setNotice({ severity: "success", text: message });
    } catch (error) {
      console.error("Reset link request failed:", error);
      setNotice({
        severity: "error",
        text: error?.message || "Could not send the reset email. Please try again.",
      });
    } finally {
      setEmailingLink(false);
    }
  };

  const pwdAccepted =
    passwords.next.length >= PWD_MIN_LENGTH && isPwdMixed(passwords.next);

  const handlePasswordChange = async () => {
    setNotice(null);
    setSavingPwd(true);
    try {
      await updatePassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "" });
      // The API revokes every session on a password change, so there is no
      // signed-in state left to return to — go straight to sign-in and say why.
      navigate("/login", {
        replace: true,
        state: {
          notice:
            "Password updated. Every device was signed out — sign in with your new password.",
        },
      });
    } catch (error) {
      console.error("Password change failed:", error);
      setSavingPwd(false);
      setNotice({
        severity: "error",
        text:
          error?.status === 401
            ? "That current password is not right."
            : error?.message ||
              "Could not change your password. Please try again.",
      });
    }
  };

  return (
    <Box component="section">
      <PageHeader
        title="Your profile"
        subtitle="Update how your name appears across the workspace and manage how you sign in."
      />

      {notice && (
        <Alert severity={notice.severity} role="alert" sx={{ mb: 2 }}>
          {notice.text}
        </Alert>
      )}

      <GlassCard padding={{ xs: 2, sm: 3 }} sx={{ maxWidth: 980 }}>
        <SettingRow
          icon={<MailOutlineRoundedIcon />}
          title="Email address"
          description="The address you sign in with, and where password reset links are sent."
        >
          <Box sx={{ textAlign: { md: "right" } }}>
            <Typography variant="body2" sx={{ fontWeight: 550 }}>
              {user?.email || "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              Member since {formatDateTime(user?.created_at)}
            </Typography>
          </Box>
        </SettingRow>

        <Divider />

        <SettingRow
          icon={<BadgeRoundedIcon />}
          title="Display name"
          description={`Currently “${user?.full_name || "not set"}”.`}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              justifyContent: { md: "flex-end" },
              width: "100%",
            }}
          >
            <TextField
              placeholder="Enter a new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameChange()}
              size="small"
              sx={{ flexGrow: 1, minWidth: 200 }}
              inputProps={{ "aria-label": "New display name" }}
            />
            <Button
              variant="contained"
              onClick={handleNameChange}
              disabled={!newName.trim() || savingName}
              startIcon={
                savingName ? (
                  <CircularProgress size={15} sx={{ color: "inherit" }} />
                ) : null
              }
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          </Box>
        </SettingRow>

        <Divider />

        {/* Two paths to the same outcome. In place is faster when the current
            password is to hand; the emailed link is the one that works when it
            is not, which is the case this section exists for. */}
        <SettingRow
          icon={<LockResetRoundedIcon />}
          title="Password"
          description={`At least ${PWD_MIN_LENGTH} characters, mixing letters with digits or symbols. Changing it signs out every device.`}
        >
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              passwords.current &&
                pwdAccepted &&
                !savingPwd &&
                handlePasswordChange();
            }}
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              justifyContent: { md: "flex-end" },
              width: "100%",
            }}
          >
            <TextField
              label="Current"
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, current: e.target.value }))
              }
              size="small"
              sx={{ flexGrow: 1, minWidth: 150 }}
            />
            <TextField
              label="New"
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              error={passwords.next !== "" && !pwdAccepted}
              helperText={
                passwords.next !== "" && !pwdAccepted
                  ? "Too simple for the policy above"
                  : " "
              }
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, next: e.target.value }))
              }
              size="small"
              sx={{ flexGrow: 1, minWidth: 150 }}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={!passwords.current || !pwdAccepted || savingPwd}
              startIcon={
                savingPwd ? (
                  <CircularProgress size={15} sx={{ color: "inherit" }} />
                ) : (
                  <LockResetRoundedIcon />
                )
              }
              sx={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}
            >
              {savingPwd ? "Updating…" : "Update"}
            </Button>
          </Box>
        </SettingRow>

        <Divider />

        <SettingRow
          icon={<MailOutlineRoundedIcon />}
          title="Change it by email instead"
          description={`Sends a single-use link to ${
            user?.email || "your address"
          }. Use this if you cannot remember your current password.`}
        >
          <Button
            variant="contained"
            onClick={handleEmailLink}
            disabled={emailingLink}
            startIcon={
              emailingLink ? (
                <CircularProgress size={15} sx={{ color: "inherit" }} />
              ) : (
                <SendRoundedIcon />
              )
            }
            sx={{ whiteSpace: "nowrap" }}
          >
            {emailingLink ? "Sending…" : "Email me a link"}
          </Button>
        </SettingRow>
      </GlassCard>
    </Box>
  );
};

export default Account;
