import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserManagement from "./components/UserManagement/UserMangement";
import RoleManagement from "./components/RoleManagement/RoleMangement";
import PermissionsManagement from "./components/PermissionManagement/PermissionManagement"; // Ensure this path is correct
import "./App.css";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          {/* <Route
            path="permissions/:roleId"
            element={<PermissionsManagement />}
          /> */}
        </Route>
        <Route
          path="/"
          element={<h1>Welcome to VRV Security RBAC Dashboard</h1>}
        />
      </Routes>
    </Router>
  );
};

export default App;
