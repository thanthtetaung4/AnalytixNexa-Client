import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, forwardRef } from "react";
import { styled, useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LogoutIcon from "@mui/icons-material/Logout";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CloseIcon from "@mui/icons-material/Close";

import useAuth from "./useAuth";

const drawerWidth = 240;
const icons = [
  <DashboardIcon key={1} />,
  <QueryStatsIcon key={2} />,
  <InsertDriveFileIcon key={3} />,
  <AnalyticsIcon key={4} />,
  <SettingsIcon key={5} />,
  <AccountBoxIcon key={6} />,
  <LogoutIcon key={7} />,
];
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const ModalBox = styled(Box)(() => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: "#1F2A40",
  border: "2px solid #1F2A40",
  borderRadius: 5,
  boxShadow: 24,
  padding: 30,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  gap: 20,
}));

const MyNavLink = forwardRef((props, ref) => (
  <NavLink
    ref={ref}
    to={props.to}
    className={({ isActive }) =>
      `${props.className} ${
        (props.location === "/dashboard" && props.activeClassName) || isActive
          ? props.activeClassName
          : ""
      }`
    }
    end
  >
    {props.children}
  </NavLink>
));

MyNavLink.displayName = "MyNavLink";
import PropTypes from "prop-types";

MyNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  activeClassName: PropTypes.string.isRequired,
  location: PropTypes.any,
  children: PropTypes.node.isRequired,
};

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function DashboardLayout() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { logout } = useAuth();
  const location = useLocation().pathname;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: { backgroundColor: "primary.dark" },
        }}
      >
        {open ? (
          <DrawerHeader>
            <Typography variant="h6" component="h1">
              AnalytixNexa
            </Typography>
            <IconButton
              onClick={handleDrawerClose}
              sx={{
                maxWidth: "45px",
              }}
            >
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
        ) : (
          <DrawerHeader>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          </DrawerHeader>
        )}
        <Divider />
        <List>
          {["Dashboard", "Analyze", "Files", "Result  "].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              sx={{ display: "block" }}
              component={MyNavLink}
              to={
                text !== "Dashboard" ? text.toLocaleLowerCase() : "/dashboard/"
              }
              location={text === "Dashboard" && location}
              activeClassName={"active-link"}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {icons[index]}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["Settings", "Account"].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              sx={{ display: "block" }}
              component={MyNavLink}
              to={text.toLocaleLowerCase()}
              activeClassName={"active-link"}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {icons[index + 4]}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
            onClick={toggleModal}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              {icons[6]}
            </ListItemIcon>
            <ListItemText primary={"Logout"} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="div" sx={{ flexGrow: 1, p: 3 }}>
        <Modal
          open={openModal}
          onClose={toggleModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <ModalBox>
            <IconButton
              onClick={toggleModal}
              sx={{
                maxWidth: "45px",
                marginLeft: "auto",
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Do you want to Logout?
            </Typography>
            <ReportProblemIcon
              size="large"
              sx={{
                fontSize: 75,
                alignSelf: "center",
                my: 3,
              }}
            />

            <Button
              onClick={logout}
              variant="contained"
              sx={{ maxWidth: 100, m: "auto", p: 1 }}
            >
              Logout
            </Button>
          </ModalBox>
        </Modal>
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
