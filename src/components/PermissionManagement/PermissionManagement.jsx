import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebaseConfig";
import "./PermissionManagement.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString();
};

export default function PermissionsManagement() {
  const { roleId } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState({
    permissionName: "",
    associatedRoles: [roleId],
  });

  useEffect(() => {
    const fetchData = async () => {
      const permissionsData = await db.collection("permissions").get();
      setPermissions(
        permissionsData.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchData();
  }, [roleId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPermission({ ...newPermission, [name]: value });
  };

  const handleAddPermission = async () => {
    const permissionObj = {
      ...newPermission,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await db.collection("permissions").add(permissionObj);
    setPermissions([...permissions, { ...permissionObj, id: docRef.id }]);
    setNewPermission({ permissionName: "", associatedRoles: [roleId] });
  };

  const handleDeletePermission = async (id) => {
    await db.collection("permissions").doc(id).delete();
    setPermissions(permissions.filter((permission) => permission.id !== id));
  };

  return (
    <div className="PermissionsManagementContainer">
      <h2 className="headings">Permissions Management for Role ID: {roleId}</h2>
      <div className="formContainer">
        <input
          type="text"
          name="permissionName"
          placeholder="Permission Name"
          value={newPermission.permissionName}
          onChange={handleInputChange}
        />
        <button onClick={handleAddPermission}>Add Permission</button>
      </div>
      <table className="permissionsTable">
        <thead>
          <tr>
            <th>Permission ID</th>
            <th>Permission Name</th>
            <th>Associated Roles</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.id}</td>
              <td>{permission.permissionName}</td>
              <td>{permission.associatedRoles.join(", ")}</td>
              <td>{formatTimestamp(permission.createdAt)}</td>
              <td>
                <button onClick={() => handleDeletePermission(permission.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
