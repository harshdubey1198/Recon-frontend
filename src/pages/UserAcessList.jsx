import React, { useState, useEffect } from "react";
import { fetchUserDetails, registerUser } from "../../server"; // adjust path
import { toast } from "react-toastify";

export default function UserAccessTable() {
  const [users, setUsers] = useState([]);
  const [userAccess, setUserAccess] = useState({});
  const [status, setStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUserDetails();
        const apiResponse = res.data; // unwrap Axios response

        if (apiResponse.status && Array.isArray(apiResponse.data)) {
          const apiUsers = apiResponse.data.map((u) => ({
            name: u.username,
            joined: new Date(u.date_joined).toISOString().split("T")[0],
          }));

          const apiUserAccess = {};
          apiResponse.data.forEach((u) => {
            apiUserAccess[u.username] = u.assigned_portals.map((portal) => ({
              domain: { name: portal.name },
              categories: portal.categories.map((c) => c.name),
              totalPosts: portal.total_posts,
            }));
          });

          setUsers(apiUsers);
          setStatus(
            apiUsers.reduce((acc, u) => ({ ...acc, [u.name]: true }), {})
          );
          setUserAccess(apiUserAccess);
        } else {
          console.error("Invalid API response", apiResponse);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    loadUsers();
  }, []);

  const toggleStatus = (userName) => {
    setStatus((prev) => ({ ...prev, [userName]: !prev[userName] }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) return;

    setIsLoading(true);

    try {
     const res = await registerUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      });
      toast.success(res.data.message );
      const newUserData = {
        name: newUser.username,
        joined: new Date().toISOString().split("T")[0],
      };

      setUsers([...users, newUserData]);
      setStatus((prev) => ({ ...prev, [newUserData.name]: true }));
      setUserAccess((prev) => ({ ...prev, [newUserData.name]: [] }));
      setNewUser({ username: "", email: "", password: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to register user:gr", err.message.username[0]);
      toast.error( err.message.username[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setNewUser({ username: "", email: "", password: "" });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          User Access Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
          <thead className="bg-black text-white">
            <tr>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                User
              </th>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                Joined Date
              </th>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                Portal
              </th>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                Categories
              </th>
              <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                Total Posts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const accessList = userAccess[user.name] || [];
              if (accessList.length === 0) {
                return (
                  <tr
                    key={user.name}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={status[user.name]}
                        onChange={() => toggleStatus(user.name)}
                      />
                    </td>
                    <td className="py-4 px-6">{user.joined}</td>
                    <td className="py-4 px-6 text-gray-500" colSpan={3}>
                      No Access Assigned
                    </td>
                  </tr>
                );
              }

              return accessList.map((access, idx) => (
                <tr
                  key={`${user.name}-${idx}`}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  {idx === 0 && (
                    <>
                      <td
                        className="py-4 px-6 font-medium text-gray-900"
                        rowSpan={accessList.length}
                      >
                        {user.name}
                      </td>
                      <td className="py-4 px-6" rowSpan={accessList.length}>
                        <input
                          type="checkbox"
                          checked={status[user.name]}
                          onChange={() => toggleStatus(user.name)}
                        />
                      </td>
                      <td className="py-4 px-6" rowSpan={accessList.length}>
                        {user.joined}
                      </td>
                    </>
                  )}
                  <td className="py-4 px-6">
                    <a
                      href={access.domain.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:underline font-medium"
                    >
                      {access.domain.name}
                    </a>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {access.categories.map((cat, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    {access.totalPosts}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-gray-600 to-gray-600 text-white rounded-t-2xl px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Add New User</h2>
                <p className="text-blue-100 text-sm">
                  Fill in the details to create a new user account
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full pl-3 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="px-8 pb-8 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-600 to-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
