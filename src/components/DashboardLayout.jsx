import { Link, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <>
      <nav>
        <Link to="/dashboard">Dasboard</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
