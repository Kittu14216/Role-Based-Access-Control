import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import Modal from "../Modal/Modal"; // Import the Modal component
import "./RoleManagement.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString();
};

const generateRoleId = (lastRoleId) => {
  return (parseInt(lastRoleId) + 1).toString().padStart(6, "0");
};

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({
    read: true,
    write: false,
    delete: false,
  });
  const [newRole, setNewRole] = useState({
    roleName: "",
    permissions: { read: true, write: false, delete: false },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lastRoleId, setLastRoleId] = useState("000000");

  useEffect(() => {
    const fetchData = async () => {
      const rolesData = await db.collection("roles").get();
      setRoles(rolesData.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      if (rolesData.docs.length > 0) {
        const lastId = Math.max(
          ...rolesData.docs.map((doc) => parseInt(doc.id))
        )
          .toString()
          .padStart(6, "0");
        setLastRoleId(lastId);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole({ ...newRole, [name]: value });
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions({ ...permissions, [name]: checked });
    setNewRole({
      ...newRole,
      permissions: { ...newRole.permissions, [name]: checked },
    });
  };

  const handleAddRole = async () => {
    const roleExists = roles.some(
      (role) => role.roleName.toLowerCase() === newRole.roleName.toLowerCase()
    );
    if (roleExists) {
      setIsModalOpen(true);
      setModalMessage("Role name already exists.");
      return;
    }

    const newRoleObj = {
      ...newRole,
      id: generateRoleId(lastRoleId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await db.collection("roles").add(newRoleObj);
    setRoles([...roles, { ...newRoleObj, id: docRef.id }]);
    setLastRoleId(newRoleObj.id);
    setNewRole({
      roleName: "",
      permissions: { read: true, write: false, delete: false },
    });
    setPermissions({ read: true, write: false, delete: false });
  };

  const handleUpdateRole = async () => {
    const updatedRole = { ...newRole, updatedAt: new Date() };
    await db.collection("roles").doc(currentRoleId).update(updatedRole);
    setRoles(
      roles.map((role) =>
        role.id === currentRoleId ? { ...updatedRole, id: currentRoleId } : role
      )
    );
    setNewRole({
      roleName: "",
      permissions: { read: true, write: false, delete: false },
    });
    setPermissions({ read: true, write: false, delete: false });
    setIsEditing(false);
    setCurrentRoleId(null);
  };

  const handleEditRole = (role) => {
    setNewRole({ roleName: role.roleName, permissions: role.permissions });
    setPermissions(role.permissions);
    setIsEditing(true);
    setCurrentRoleId(role.id);
  };

  const handleDeleteRole = async (roleId) => {
    await db.collection("roles").doc(roleId).delete();
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="RoleManagementContainer">
      <h2 className="headings">Role Management System</h2>
      <div className="roleformContainer">
        <input
          type="text"
          name="roleName"
          placeholder="Role Name"
          value={newRole.roleName}
          onChange={handleInputChange}
        />
        <div className="permissionsDropdown">
          <label>
            <input
              type="checkbox"
              name="read"
              checked={permissions.read}
              onChange={handlePermissionChange}
            />{" "}
            Read
          </label>
          <label>
            <input
              type="checkbox"
              name="write"
              checked={permissions.write}
              onChange={handlePermissionChange}
            />{" "}
            Write
          </label>
          <label>
            <input
              type="checkbox"
              name="delete"
              checked={permissions.delete}
              onChange={handlePermissionChange}
            />{" "}
            Delete
          </label>
        </div>
        {isEditing ? (
          <button onClick={handleUpdateRole}>Update Role</button>
        ) : (
          <button onClick={handleAddRole}>Add Role</button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
      <table className="roleTable">
        <thead>
          <tr>
            <th>Role ID</th>
            <th>Role Name</th>
            <th>Permissions</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td data-label="Role ID" className="roleId">
                {role.id}
              </td>
              <td data-label="Role Name">{role.roleName}</td>
              <td data-label="Permissions">
                <div>
                  {Object.entries(role.permissions).map(([key, value]) => (
                    <span key={key}>{value && `[${key}] `}</span>
                  ))}
                </div>
              </td>
              <td data-label="Created At">{formatTimestamp(role.createdAt)}</td>
              <td data-label="Updated At">{formatTimestamp(role.updatedAt)}</td>
              <td data-label="Actions">
                <button
                  className="editButton"
                  onClick={() => handleEditRole(role)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteRole(role.id)}
                >
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
