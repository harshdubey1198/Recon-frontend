import React, { useEffect, useState } from "react";
import { fetchPortalStatusByUsername, fetchAllUsersList, mapPortalUser } from "../../server";
import { toast } from "react-toastify";
export default function PortalManagement() {
  const [username, setUsername] = useState("");
  const [portalData, setPortalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ username: "", user_id: null });



  useEffect(() => {
    (async () => {
      const res = await fetchAllUsersList();
      if (res.data?.status) setUsers(res.data.data);
    })();
  }, []);

  const handleCheckUsername = async (name = selectedUser.username) => {
    if (!name.trim()) {
  toast.warning("⚠️ Please enter a username");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchPortalStatusByUsername(name);
      if (res.data?.status) {
        // Attach user_id from users list
        const mappedData = res.data.data.map((item) => {
          const user = users.find((u) => u.username === item.username);
          return { ...item, user_id: user?.user_id || null };
        });
        setPortalData(mappedData);
        setShowModal(true);
      } else {
         toast.info("No data found for this username");
        setPortalData([]);
      }
    } catch (err) {
      console.error("Error fetching portal data:", err);
      toast.error("❌ Error fetching data. Check console for details.");
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

       <ul className="space-y-2">
        <h2>List of Users </h2>
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
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-gray-600 hover:text-black"
              >
                ✖
              </button>
              {portalData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Portal</th>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Found</th>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Username</th>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Message</th>
                        <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {portalData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition duration-150">
                          <td className="py-3 px-6 font-medium text-gray-900">{item.portal}</td>
                          <td className="py-3 px-6">
                            {item.found ? (
                              <span className="text-green-600 font-semibold">Found</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Not Found</span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-gray-700">{item.username || "-"}</td>
                          <td className="py-3 px-6 text-gray-500">{item.message || "-"}</td>
                          <td className="py-3 px-6 text-right">
                            {!item.found && (
                              <button
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    await mapPortalUser(selectedUser.username, selectedUser.user_id);
                                    handleCheckUsername();
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                              >
                                Retry
                              </button>
                            )}
                          </td>
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
