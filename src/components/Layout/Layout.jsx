import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="LayoutContainer">
      <div className="fixed">
        <h2 className="heading1">Welcome to VRV Security RBAC Dashboard</h2>
        <h2 className="heading">Role-Based Access Control (RBAC)</h2>
      </div>
      <div className="navButtons">
        <NavLink to="/users">
          <button className="btn usersButton">User Management</button>
        </NavLink>
        <NavLink to="/roles">
          <button className="btn rolesButton">Role Management</button>
        </NavLink>
        {/* <NavLink to="permissions/">
          <button className="btn permissionsButton">
            Permission Management
          </button>
        </NavLink> */}
      </div>
      <Outlet />
    </div>
  );
}
