import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Avatar,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import PropTypes from "prop-types";

import useAuth from "./useAuth";
import useApiHealth from "./useApiHealth";
import { useThemeContext } from "../theme/ThemeContextProvider";
import { AuroraBackground, BrandMark, GlassDialog, StatusDot } from "./ui";

/* The sidebar is navigation, not a feature. Both widths are as narrow as the
   content allows — a 56px rail fits a 20px icon with a comfortable hit area,
   and 196px fits the longest label ("Overview") without wrapping. That returns
   roughly 60px of the viewport to the charts, which are the actual product. */
const RAIL = 56;
const PANEL = 196;
const ROW_HEIGHT = 38;

const PRIMARY_NAV = [
  {
    label: "Overview",
    to: "/dashboard",
    end: true,
    icon: <SpaceDashboardRoundedIcon />,
  },
  { label: "Analyze", to: "/dashboard/analyze", icon: <QueryStatsRoundedIcon /> },
  { label: "Files", to: "/dashboard/files", icon: <FolderRoundedIcon /> },
  { label: "Results", to: "/dashboard/result", icon: <InsightsRoundedIcon /> },
];

const SECONDARY_NAV = [
  { label: "Settings", to: "/dashboard/settings", icon: <SettingsRoundedIcon /> },
  { label: "Account", to: "/dashboard/account", icon: <PersonRoundedIcon /> },
];

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

const ENGINE_LABEL = {
  online: "Engine online",
  offline: "Engine unreachable",
  checking: "Checking engine…",
};

/** Single sidebar row. Active state is a tinted pill plus a left glow bar —
 *  two signals, so it never relies on colour alone. */
const NavRow = ({ item, expanded, onNavigate }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={expanded ? "" : item.label}
      placement="right"
      arrow
      disableHoverListener={expanded}
    >
      <ListItemButton
        component={NavLink}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        sx={{
          position: "relative",
          minHeight: ROW_HEIGHT,
          px: 1,
          mb: 0.25,
          borderRadius: 1.5,
          justifyContent: expanded ? "flex-start" : "center",
          color: "text.secondary",
          overflow: "hidden",
          "&:hover": {
            bgcolor: theme.palette.glass.surface,
            color: "text.primary",
          },
          "&.active": {
            color: "text.primary",
            background: theme.gradients.brandSoft,
            borderColor: alpha(theme.palette.primary.main, 0.28),
            "& .MuiListItemIcon-root": { color: theme.palette.primary.light },
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 16,
              borderRadius: 999,
              background: theme.gradients.brand,
              boxShadow: `0 0 12px 1px ${theme.palette.primary.main}`,
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: expanded ? 1.25 : 0,
            justifyContent: "center",
            color: "inherit",
            transition: `margin ${theme.motion.base}ms ${theme.motion.ease}`,
            "& svg": { fontSize: 19 },
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: 550 }}
          sx={{
            my: 0,
            opacity: expanded ? 1 : 0,
            whiteSpace: "nowrap",
            transition: `opacity ${theme.motion.fast}ms ${theme.motion.ease}`,
          }}
        />
      </ListItemButton>
    </Tooltip>
  );
};

NavRow.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    end: PropTypes.bool,
    icon: PropTypes.node,
  }).isRequired,
  expanded: PropTypes.bool,
  onNavigate: PropTypes.func,
};

function DashboardLayout() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const apiHealth = useApiHealth();
  const { mode, toggleColorMode } = useThemeContext();
  const pathname = useLocation().pathname;

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // close the mobile drawer whenever the route changes, so navigating never
  // leaves the overlay covering the page the user just asked for
  useEffect(() => setMobileOpen(false), [pathname]);

  const railExpanded = isMobile ? true : expanded;
  const current = ALL_NAV.find((n) =>
    n.end ? pathname === n.to || pathname === `${n.to}/` : pathname.startsWith(n.to)
  );

  const displayName = user?.full_name || user?.email?.split("@")[0] || "there";
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const engineTone =
    apiHealth.state === "offline"
      ? theme.palette.error.main
      : apiHealth.state === "checking"
      ? theme.palette.text.disabled
      : theme.palette.success.main;

  const sidebar = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        px: 1,
        py: 1.5,
      }}
    >
      {/* One toggle, in one place. The old header had a collapse button that
          vanished on collapse and a second expand button below it. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: railExpanded ? "space-between" : "center",
          gap: 0.5,
          minHeight: 36,
          mb: 1.5,
        }}
      >
        <BrandMark compact={!railExpanded} size={28} />
        {!isMobile && railExpanded && (
          <IconButton
            onClick={() => setExpanded(false)}
            aria-label="Collapse sidebar"
            size="small"
          >
            <MenuOpenIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {!railExpanded && !isMobile && (
        <Tooltip title="Expand sidebar" placement="right" arrow>
          <IconButton
            onClick={() => setExpanded(true)}
            aria-label="Expand sidebar"
            size="small"
            sx={{ mx: "auto", mb: 1 }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* The section headings ("Workspace", "Preferences") labelled two groups
          of four and two rows. A divider says the same thing in no space. */}
      <List disablePadding>
        {PRIMARY_NAV.map((item) => (
          <NavRow key={item.to} item={item} expanded={railExpanded} />
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <List disablePadding>
        {SECONDARY_NAV.map((item) => (
          <NavRow key={item.to} item={item} expanded={railExpanded} />
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Engine status, down from a bordered card to one line. The dot alone
          carries it when collapsed, and the tooltip has the detail either way. */}
      <Tooltip
        title={apiHealth.message || ENGINE_LABEL[apiHealth.state]}
        placement="right"
        arrow
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: railExpanded ? "flex-start" : "center",
            gap: 1,
            px: railExpanded ? 1 : 0,
            py: 0.75,
            mb: 0.25,
            cursor: "default",
          }}
        >
          <StatusDot color={engineTone} pulse={apiHealth.state === "online"} />
          {railExpanded && (
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", whiteSpace: "nowrap" }}
            >
              {ENGINE_LABEL[apiHealth.state]}
            </Typography>
          )}
        </Box>
      </Tooltip>

      <Tooltip
        title={railExpanded ? "" : "Log out"}
        placement="right"
        arrow
        disableHoverListener={railExpanded}
      >
        <ListItemButton
          onClick={() => setLogoutOpen(true)}
          sx={{
            minHeight: ROW_HEIGHT,
            px: 1,
            borderRadius: 1.5,
            justifyContent: railExpanded ? "flex-start" : "center",
            color: "text.secondary",
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: railExpanded ? 1.25 : 0,
              justifyContent: "center",
              color: "inherit",
              "& svg": { fontSize: 19 },
            }}
          >
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Log out"
            primaryTypographyProps={{ fontSize: "0.8125rem", fontWeight: 550 }}
            sx={{ my: 0, opacity: railExpanded ? 1 : 0, whiteSpace: "nowrap" }}
          />
        </ListItemButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AuroraBackground />

      {/* ── sidebar: persistent rail on desktop, overlay on mobile ── */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: PANEL,
              border: "none",
              borderRight: `1px solid ${theme.palette.glass.border}`,
              bgcolor: theme.palette.glass.bgDeep,
              backgroundImage: theme.gradients.brandSoft,
            },
          }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Box
          component="nav"
          aria-label="Main navigation"
          sx={{
            position: "fixed",
            inset: "0 auto 0 0",
            zIndex: theme.zIndex.drawer,
            width: expanded ? PANEL : RAIL,
            transition: `width ${theme.motion.base}ms ${theme.motion.ease}`,
            borderRight: `1px solid ${theme.palette.glass.border}`,
            bgcolor: alpha(theme.palette.glass.bgDeep, 0.55),
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* ── main column ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flexGrow: 1,
          minWidth: 0,
          ml: isMobile ? 0 : `${expanded ? PANEL : RAIL}px`,
          transition: `margin-left ${theme.motion.base}ms ${theme.motion.ease}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 2, md: 2.5 },
            py: 1,
            borderBottom: `1px solid ${theme.palette.glass.border}`,
            bgcolor: alpha(theme.palette.glass.bgDeep, 0.6),
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <MenuIcon />
            </IconButton>
          )}

          {/* The "Dashboard" eyebrow above the page name said nothing the
              sidebar had not already said. One line is enough. */}
          <Typography
            variant="subtitle1"
            sx={{
              minWidth: 0,
              flexGrow: 1,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {current?.label || "Overview"}
          </Typography>

          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              onClick={toggleColorMode}
              aria-label="Toggle colour mode"
              size="small"
              sx={{
                border: `1px solid ${theme.palette.glass.border}`,
                bgcolor: theme.palette.glass.surface,
              }}
            >
              {mode === "dark" ? (
                <LightModeRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <DarkModeRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={user?.email || displayName}>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#fff",
                background: theme.gradients.brand,
                boxShadow: `0 6px 18px -6px ${theme.palette.primary.main}AA`,
              }}
            >
              {initials || "A"}
            </Avatar>
          </Tooltip>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, md: 2.5 },
            py: { xs: 2, md: 2.5 },
            maxWidth: 1440,
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <GlassDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out of AnalytixNexa?"
        icon={<WarningAmberRoundedIcon />}
        actions={
          <>
            <Button variant="text" onClick={() => setLogoutOpen(false)}>
              Stay signed in
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={signOut}
              startIcon={<LogoutRoundedIcon />}
              sx={{ background: theme.palette.error.main }}
            >
              Log out
            </Button>
          </>
        }
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Your uploaded files and saved results stay in your account — you can
          pick up where you left off next time you sign in.
        </Typography>
      </GlassDialog>
    </Box>
  );
}

export default DashboardLayout;
