import React, { useEffect, useState } from "react";
import { fetchAllUsersListSimple } from "../../../server";
import { useAuth } from "../../context/AuthContext";
import formatUsername from "../../utils/formateName";

export default function UserFilter({ onChange }) {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch users if current user is a master
    if (user?.role === "master") {
      fetchAllUsersListSimple()
        .then((res) => {
          if (res?.data?.data) setUsers(res.data.data);
        })
        .catch((err) => console.error("Failed to load users:", err));
    }
  }, [user]);

  // 🔹 If user is not master, hide this filter completely
  if (!user || user.role !== "master") return null;

  return (
    <select
      className="border rounded-lg p-2 w-full"
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All Users</option>
      {users.map((u) => (
        <option key={u.id} value={u.username}>
         {formatUsername(u.username)}
        </option>
      ))}
    </select>
  );
}
