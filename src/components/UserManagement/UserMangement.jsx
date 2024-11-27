import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import Modal from "../Modal/Modal"; // Import the Modal component
import "./UserManagement.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date.toLocaleString();
};

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", name: "", roles: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [errors, setErrors] = useState({ email: "", name: "", roles: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.roles.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setNewUser({ ...newUser, roles: value });
    setErrors({ ...errors, roles: "" });
  };

  const handleAddUser = async () => {
    if (!isFormValid()) {
      validateForm();
      setIsModalOpen(true);
      setModalMessage("Please fill all fields.");
      return;
    }

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
    if (!isFormValid()) {
      validateForm();
      setIsModalOpen(true);
      setModalMessage("Please fill all fields.");
      return;
    }

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

  const isFormValid = () => {
    return (
      newUser.email &&
      newUser.name &&
      newUser.roles &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newUser.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!newUser.name) {
      newErrors.name = "Name is required.";
    }
    if (!newUser.roles) {
      newErrors.roles = "Role is required.";
    }
    setErrors(newErrors);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="UserManagementContainer">
      <h2 className="headings">User Management System</h2>
      <input
        type="text"
        placeholder="Search by name, email, or role"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="searchInput"
      />
      <div className="formContainer">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
          required
        />
        {errors.email && <div className="error">{errors.email}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newUser.name}
          onChange={handleInputChange}
          required
        />
        {errors.name && <div className="error">{errors.name}</div>}
        <div className="dropdown">
          <select value={newUser.roles} onChange={handleRoleChange} required>
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
        {errors.roles && <div className="error">{errors.roles}</div>}
        {isEditing ? (
          <button
            className="btnclick"
            onClick={handleUpdateUser}
            disabled={!isFormValid()}
          >
            Update User
          </button>
        ) : (
          <button
            className="btnclick"
            onClick={handleAddUser}
            disabled={!isFormValid()}
          >
            Add User
          </button>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
      <table className="userTable">
        <thead>
          <tr>
            <th>User ID</th>
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
          {filteredUsers.map((user) => (
            <tr key={user.userId}>
              <td data-label="User ID">{user.userId}</td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Name">{toTitleCase(user.name)}</td>
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
