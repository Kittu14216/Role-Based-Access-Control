import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const PermissionsManagement = ({ roleId }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const roleDoc = await getDoc(doc(db, "roles", roleId));
      setRole({ ...roleDoc.data(), id: roleDoc.id });
    };
    fetchRole();
  }, [roleId]);

  const togglePermission = async (permission) => {
    const updatedPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    const roleDoc = doc(db, "roles", role.id);
    await updateDoc(roleDoc, {
      permissions: updatedPermissions,
      updatedAt: serverTimestamp(),
    });
    setRole({ ...role, permissions: updatedPermissions });
  };

  if (!role) return null;

  return (
    <div>
      <h2>Manage Permissions for {role.roleName}</h2>
      <ul>
        {["Read", "Update", "Delete"].map((permission) => (
          <li key={permission}>
            <label>
              <input
                type="checkbox"
                checked={role.permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
              />
              {permission}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PermissionsManagement;
