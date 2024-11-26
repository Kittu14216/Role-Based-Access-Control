import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({
    roleName: "",
    permissions: { read: "", update: "", delete: "" },
    customAttrs: {},
    roleId: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesCollection = await getDocs(collection(db, "roles"));
      setRoles(
        rolesCollection.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };
    fetchRoles();
  }, []);

  const addRole = async () => {
    const roleId = doc(collection(db, "roles")).id;
    await addDoc(collection(db, "roles"), {
      ...newRole,
      roleId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewRole({
      roleName: "",
      permissions: { read: "", update: "", delete: "" },
      customAttrs: {},
      roleId: "",
    });
  };

  const deleteRole = async (id) => {
    await deleteDoc(doc(db, "roles", id));
  };

  return (
    <div>
      <h2>Role Management</h2>
      <input
        type="text"
        placeholder="Role Name"
        value={newRole.roleName}
        onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
      />
      <button onClick={addRole}>Add Role</button>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>
            {role.roleName}
            <button onClick={() => deleteRole(role.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoleManagement;
