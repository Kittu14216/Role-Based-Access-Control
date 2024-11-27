import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import "./UserManagement.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString();
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", name: "", roles: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await db.collection("users").get();
      const rolesData = await db.collection("roles").get();
      setUsers(
        usersData.docs.map((doc) => ({ ...doc.data(), userId: doc.id }))
      );
      setRoles(rolesData.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setNewUser({ ...newUser, roles: value });
  };

  const handleAddUser = async () => {
    const newUserObj = {
      ...newUser,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await db.collection("users").add(newUserObj);
    setUsers([...users, { ...newUserObj, userId: docRef.id }]);
    setNewUser({ email: "", name: "", roles: "" });
  };

  const handleUpdateUser = async () => {
    const updatedUser = {
      ...newUser,
      updatedAt: new Date(),
    };
    await db.collection("users").doc(currentUserId).update(updatedUser);
    setUsers(
      users.map((user) =>
        user.userId === currentUserId
          ? { ...updatedUser, userId: currentUserId }
          : user
      )
    );
    setNewUser({ email: "", name: "", roles: "" });
    setIsEditing(false);
    setCurrentUserId(null);
  };

  const handleEditUser = (user) => {
    setNewUser({ email: user.email, name: user.name, roles: user.roles });
    setIsEditing(true);
    setCurrentUserId(user.userId);
  };

  const handleDeleteUser = async (userId) => {
    await db.collection("users").doc(userId).delete();
    setUsers(users.filter((user) => user.userId !== userId));
  };

  const handleStatusChange = async (userId) => {
    const user = users.find((user) => user.userId === userId);
    const updatedUser = {
      ...user,
      status: !user.status,
      updatedAt: new Date(),
    };
    await db.collection("users").doc(userId).update(updatedUser);
    setUsers(users.map((u) => (u.userId === userId ? updatedUser : u)));
  };

  return (
    <div className="UserManagementContainer">
      <h2 className="headings">User Management System</h2>
      <div className="formContainer">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newUser.name}
          onChange={handleInputChange}
        />
        <div className="dropdown">
          <select value={newUser.roles} onChange={handleRoleChange}>
            <option value="" disabled>
              Select Role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.roleName}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
        {isEditing ? (
          <button onClick={handleUpdateUser}>Update User</button>
        ) : (
          <button onClick={handleAddUser}>Add User</button>
        )}
      </div>
      <table className="userTable">
        <thead>
          <tr>
            <th>User ID </th>
            <th>Email</th>
            <th>Name</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td data-label="User ID">{user.userId}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Name">{user.name}</td>
              <td data-label="Roles">{user.roles}</td>
              <td data-label="Status">
                <button
                  className="statusButton"
                  onClick={() => handleStatusChange(user.userId)}
                >
                  {user.status ? "Active" : "Inactive"}
                </button>
              </td>
              <td data-label="Created At">{formatTimestamp(user.createdAt)}</td>
              <td data-label="Updated At">{formatTimestamp(user.updatedAt)}</td>
              <td data-label="Actions">
                <button
                  className="updateButton"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteUser(user.userId)}
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
