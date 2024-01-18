// import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";

import useAuth from "../../components/useAuth";

function Dashboard() {
  const auth = useAuth();

  return (
    <>
      <nav>
        <Link to="/dashboard/settings">Settings</Link>
        <Link to="/dashboard/account">Accounts</Link>
      </nav>
      <main>
        <h1>Dashboard</h1>
        <Button>
          hit it <LightModeIcon />
          <DarkModeIcon />
        </Button>
        <Button onClick={auth.logout}>
          Sign Out <LogoutIcon />
        </Button>
        <Outlet />
      </main>
    </>
  );
}

export default Dashboard;
