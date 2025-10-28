import React, { useEffect, useState } from "react";
import { fetchAllUsersList } from "../../../server";
import { useAuth } from "../../context/AuthContext";
import formatUsername from "../../utils/formateName";

export default function UserFilter({ onChange, value = "" }) {
  const [users, setUsers] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadUsers = async (page = 1, append = false) => {
    try {
      setIsLoading(true);
      const res = await fetchAllUsersList(page);
      if (res?.data?.status && Array.isArray(res.data.data)) {
        const newUsers = res.data.data;
        setUsers((prev) => (append ? [...prev, ...newUsers] : newUsers));

        const nextUrl = res.data?.pagination?.next;
        if (nextUrl) {
          const nextPageParam = new URL(nextUrl).searchParams.get("page");
          setNextPage(Number(nextPageParam));
        } else {
          setNextPage(null);
        }
      }
    } catch (err) {
      console.error("❌ Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "master") {
      loadUsers();
    }
  }, [user]);

  if (!user || user.role !== "master") return null;

  return (
    <select
      className="border rounded-lg p-2 w-full"
      value={value}
      onChange={async (e) => {
        const val = e.target.value;

        if (val === "load_more") {
          if (nextPage) {
            await loadUsers(nextPage, true);
          }
          return;
        }

        onChange(val);
      }}
    >
      <option value="">All Users</option>

      {users.map((u) => (
        <option key={u.id} value={u.username}>
         {formatUsername(u.username)}
        </option>
      ))}
      {nextPage && (
        <option value="load_more" disabled={isLoading}>
          {isLoading ? "Loading more..." : "↓ Load More Users"}
        </option>
      )}
    </select>
  );
}
