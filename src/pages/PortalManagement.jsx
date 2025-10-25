import React, { useEffect, useState, useRef } from "react";
import {
  fetchPortalStatusByUsername,
  fetchAllUsersList,
  mapPortalUser,
} from "../../server";
import { toast } from "react-toastify";
import { flushSync } from "react-dom";

export default function PortalManagement() {
  const [username, setUsername] = useState("");
  const [portalData, setPortalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    username: "",
    user_id: null,
  });

  // 🆕 Pagination states
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef(null);

  // 🆕 Fetch users with pagination
  useEffect(() => {
     fetchUsers(1);
   }, []);
 
   // 👉 Fetch users (handles pagination)
   const fetchUsers = async (pageNumber) => {
     if (isFetching) return;
     setIsFetching(true);
     try {
       const res = await fetchAllUsersList(pageNumber);
       if (res.data?.status) {
         setPagination(res.data.pagination);
 
         // Append or prepend depending on scroll direction
         if (pageNumber > (pagination?.current_page || page)) {
           setUsers((prev) => [...prev, ...res.data.data]); // next page → append
         }  else {
           setUsers(res.data.data);
         }
 
         setPage(pageNumber);
       }
     } catch (err) {
       console.error("Error fetching users:", err);
       toast.error("Failed to fetch users");
     } finally {
       setIsFetching(false);
     }
   };
 

  // 🆕 Scroll handler
   const handleScroll = () => {
    if (!scrollRef.current || !pagination) return;

    const container = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // When scrolled to bottom — fetch next page
    if (scrollTop + clientHeight >= scrollHeight - 10 && pagination.next && !isFetching) {
      const nextPage = page + 1;
      if (nextPage <= pagination.total_pages) {
        fetchUsers(nextPage);
      }
    }

    // When scrolled to top — fetch previous page
    if (scrollTop === 0 && pagination.previous && !isFetching) {
      const prevPage = page - 1;
      if (prevPage >= 1) {
        const currentScrollHeight = scrollHeight;
        fetchUsers(prevPage).then(() => {
          // Maintain visual position
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - currentScrollHeight;
          });
        });
      }
    }
  };

  // 🆕 Attach scroll listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pagination, page, isFetching]);

  // 👉 Fetch portal status for a user
 const handleCheckUsername = async (name = selectedUser.username) => {
  if (!name.trim()) {
    toast.warning(" Please enter a username");
    return;
  }
  setLoading(true);
  try {
    const res = await fetchPortalStatusByUsername(name);
    if (res.data?.status) {
      const mappedData = res.data.data.map((item) => {
        const user = users.find((u) => u.username === item.username);
        return { ...item, user_id: user?.user_id || null };
      });
      setPortalData(mappedData); // ✅ Only load data now
    } else {
      toast.info("No data found for this username");
      setPortalData([]);
    }
  } catch (err) {
    console.error("Error fetching portal data:", err);
    toast.error(
      err.response?.data?.message || "Error fetching data. Check console for details."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Optional manual search (kept commented) */}
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

        {/* 🧍‍♂️ User List with Infinite Scroll */}
        <ul className="space-y-2">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            List of Users
          </h1>
          <div
            ref={scrollRef}
            className="user-scroll-container max-h-[70vh] overflow-y-auto pr-2 rounded-lg"
          >
            <ul className="space-y-3">
              {users.map((u, i) => (
                <li
                  key={u.id}
                 onClick={() => {
  flushSync(() => {
    setSelectedUser({ username: u.username, user_id: u.id });
    setShowModal(true); // ✅ Open modal instantly
    setPortalData([]);  // ✅ Clear old data (optional)
  });
  handleCheckUsername(u.username); // 🔄 Load data asynchronously
}}

                  className="group relative p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-black hover:shadow-lg hover:-translate-y-1 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white"
                >
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-black transition-colors">
                    {u.username}
                  </span>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </li>
              ))}
            </ul>

            {/* 🕓 Loading indicator */}
            {isFetching && (
              <div className="text-center py-3 text-gray-500">Loading...</div>
            )}
          </div>
        </ul>

        {/* 🪟 Modal for portal data */}
     {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-28 pl-72 z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
                    {/* Close button */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-2 right-3 text-gray-600 hover:text-black"
                    >
                      ✖
                    </button>

                    {/* Table structure always visible */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
                        <thead className="bg-black text-white">
                          <tr>
                            <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                              Portal
                            </th>
                            <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                              Found
                            </th>
                            <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                              Username
                            </th>
                            <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                              Message
                            </th>
                            <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                          {/* 🔄 Show loader while API fetching */}
                          {loading ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="py-10 text-center text-gray-600 font-medium"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                                  <p className="mt-3">Loading data...</p>
                                </div>
                              </td>
                            </tr>
                          ) : portalData.length > 0 ? (
                            portalData.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 transition duration-150"
                              >
                                <td className="py-3 px-6 font-medium text-gray-900">
                                  {item.portal}
                                </td>
                                <td className="py-3 px-6">
                                  {item.found ? (
                                    <span className="text-green-600 font-semibold">Found</span>
                                  ) : (
                                    <span className="text-red-600 font-semibold">
                                      Not Found
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-6 text-gray-700">
                                  {item.username || "-"}
                                </td>
                                <td className="py-3 px-6 text-gray-500">
                                  {item.message || "-"}
                                </td>
                                <td className="py-3 px-6 text-right">
                                  {!item.found && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          setLoading(true);
                                          await mapPortalUser(
                                            selectedUser.username,
                                            selectedUser.user_id
                                          );
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
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="text-center text-gray-500 py-8 font-medium"
                              >
                                No data found for this user.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { fetchPortalStatusByUsername, fetchAllUsersList, mapPortalUser } from "../../server";
// import { toast } from "react-toastify";
// export default function PortalManagement() {
//   const [username, setUsername] = useState("");
//   const [portalData, setPortalData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState({ username: "", user_id: null });



//   useEffect(() => {
//     (async () => {
//       const res = await fetchAllUsersList();
//       if (res.data?.status) setUsers(res.data.data);
//     })();
//   }, []);

//   const handleCheckUsername = async (name = selectedUser.username) => {
//     if (!name.trim()) {
//   toast.warning("⚠️ Please enter a username");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetchPortalStatusByUsername(name);
//       if (res.data?.status) {
//         // Attach user_id from users list
//         const mappedData = res.data.data.map((item) => {
//           const user = users.find((u) => u.username === item.username);
//           return { ...item, user_id: user?.user_id || null };
//         });
//         setPortalData(mappedData);
//         setShowModal(true);
//       } else {
//          toast.info("No data found for this username");
//         setPortalData([]);
//       }
//     } catch (err) {
//       console.error("Error fetching portal data:", err);
//       toast.error("❌ Error fetching data. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

//         {/* <div className="flex gap-3 mb-6">
//           <input
//             type="text"
//             placeholder="Enter username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
//           />
//           <button
//             onClick={handleCheckUsername}
//             disabled={loading}
//             className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
//           >
//             {loading ? "Checking..." : "Check"}
//           </button>
//         </div> */}

//        <ul className="space-y-2">
//         <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
//           List of Users
//         </h1>
//             {users.map((u, i) => (
//                 <li
//                 key={i}
//                 onClick={() => {
//                     setSelectedUser({ username: u.username, user_id: u.id });
//                     handleCheckUsername(u.username); 
//                 }}
//                 className="p-2 border rounded cursor-pointer hover:bg-gray-100"
//                 >
//                 {u.username}
//                 </li>
//             ))}
//             </ul>

//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-28 pl-72">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="absolute top-2 right-3 text-gray-600 hover:text-black"
//               >
//                 ✖
//               </button>
//               {portalData.length > 0 && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
//                     <thead className="bg-black text-white">
//                       <tr>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Portal</th>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Found</th>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Username</th>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Message</th>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {portalData.map((item, index) => (
//                         <tr key={index} className="hover:bg-gray-50 transition duration-150">
//                           <td className="py-3 px-6 font-medium text-gray-900">{item.portal}</td>
//                           <td className="py-3 px-6">
//                             {item.found ? (
//                               <span className="text-green-600 font-semibold">Found</span>
//                             ) : (
//                               <span className="text-red-600 font-semibold">Not Found</span>
//                             )}
//                           </td>
//                           <td className="py-3 px-6 text-gray-700">{item.username || "-"}</td>
//                           <td className="py-3 px-6 text-gray-500">{item.message || "-"}</td>
//                           <td className="py-3 px-6 text-right">
//                             {!item.found && (
//                               <button
//                                 onClick={async () => {
//                                   try {
//                                     setLoading(true);
//                                     await mapPortalUser(selectedUser.username, selectedUser.user_id);
//                                     handleCheckUsername();
//                                   } catch (err) {
//                                     console.error(err);
//                                   } finally {
//                                     setLoading(false);
//                                   }
//                                 }}
//                                 className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
//                               >
//                                 Retry
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
