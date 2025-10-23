import React, { useEffect, useState } from "react";
import { fetchAllUsersList, fetchAssignmentsByUsername } from "../../server";
import { toast } from "react-toastify";


export default function UserCategories() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ username: "", user_id: null });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetchAllUsersList();
      if (res.data?.status) setUsers(res.data.data);
    })();
  }, []);

  const handleCheckUsername = async (name = selectedUser.username) => {
    if (!name.trim()) {
      toast.warning(" Please enter a username");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchAssignmentsByUsername(name);
      if (res.data?.status) {
        setAssignments(res.data.data);
        setShowModal(true);
      } else {
        toast.info("No assignments found for this username");
        setAssignments([]);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error(err.response?.data?.message );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

        {/* <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={handleCheckUsername}
            disabled={loading}
            className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div> */}
        List of Users 
        <ul className="space-y-2">
          {users.map((u, i) => (
            <li
              key={i}
              onClick={() => {
                setSelectedUser({ username: u.username, user_id: u.id });
                handleCheckUsername(u.username); 
              }}
              className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            >
              {u.username}
            </li>
          ))}
        </ul>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-28 pl-72">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
              <h2 className="text-xl font-semibold mb-4">Details of categories assigned to: {selectedUser.username}</h2>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-gray-600 hover:text-black"
              >
                ✖
              </button>
              {assignments.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
                    <thead className="bg-black text-white">
                      <tr>
                        {/* <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Category</th> */}
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Master Category</th>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assignments.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition duration-150">
                          {/* <td className="py-3 px-6 text-gray-700">{item.group || "-"}</td> */}
                          <td className="py-3 px-6 text-gray-700">{item.master_category?.name || "-"}</td>
                          <td className="py-3 px-6 text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
