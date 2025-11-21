import React, { useState, useEffect } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { fetchUserPostStats } from "../../server";
import { toast } from "react-toastify";
import formatUsername from "../utils/formateName";
import MasterFilter from "../components/filters/MasterFilter";
import UserDetailPanel from "../components/UserDetailPanel";
import DownloadButton from "../components/DownLoad/DownloadButton";

const UserStats = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Filters
  const [dateFilter, setDateFilter] = useState("today");

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const handleUserClick = (user) => {
    setSelectedUserDetail({
      id: user.created_by_id,
      name: formatUsername(user.created_by__username),
    });
    setShowDetailPanel(true);
  };

  const handleClosePanel = () => {
    setShowDetailPanel(false);
    setSelectedUserDetail(null);
  };

  // 🔹 Load user stats
  const loadStats = async (filters = {}) => {
    try {
      setIsLoading(true);

      const df = filters.date_filter || dateFilter;
      let range = "";
      let start_date = "";
      let end_date = "";

      if (typeof df === "string") {
        range = df;
      } else if (typeof df === "object" && df !== null) {
        range = df.date_filter || "custom";
        start_date = df.start_date || "";
        end_date = df.end_date || "";
      }

      const params = { page };
      if (range && range !== "all") params.range = range;
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;
      if (filters.user_id || selectedUserId)
        params.user_id = filters.user_id || selectedUserId;

      const res = await fetchUserPostStats(params);

      if (res?.data?.status) {
        setStats(res.data.data || []);
        setPage(res.data.pagination.page || 1);
        setTotalPages(res.data.pagination.total_pages || 1);
      } else {
        toast.error("Failed to fetch user stats.");
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      toast.error("Error fetching stats.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [page]);

  const handleFilterChange = (filters) => {
    setDateFilter(filters.date_filter || "");
    setSelectedUser(filters.username || "");
    setSelectedUserId(filters.user_id || "");
    setPage(1);
    loadStats(filters);
  };

 const handleClear = () => {
  setDateFilter("today");   // ← set back to default
  setSelectedUser("");
  setSelectedUserId("");
  setPage(1);
  loadStats({ date_filter: "today" });
};


  // 🔹 Define columns for download
  const downloadColumns = [
    { 
      key: "user", 
      label: "User",
      getValue: (row) => formatUsername(row.created_by__username)
    },
    { 
      key: "num_master_posts", 
      label: "Master Posts" 
    },
    { 
      key: "num_total_distributions", 
      label: "Distributions" 
    },
    { 
      key: "num_successful_distributions", 
      label: "Successful" 
    },
    { 
      key: "num_failed_distributions", 
      label: "Failed" 
    },
    { 
      key: "categories", 
      label: "Categories",
      getValue: (row) => row.assigned_master_categories?.length 
        ? row.assigned_master_categories.join(", ") 
        : "—"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">User Stats</h1>
                <p className="text-gray-300 text-sm">
                  Overview of users and their publishing activity
                </p>
              </div>
            </div>

            {/* Download Button Component */}
                <DownloadButton 
                data={stats}
                columns={downloadColumns}
                filename={`User_Stats_${new Date().toISOString().split('T')[0]}${
                  dateFilter && dateFilter !== 'all' 
                    ? typeof dateFilter === 'string' 
                      ? `_${dateFilter}` 
                      : dateFilter.start_date && dateFilter.end_date
                        ? `_${dateFilter.start_date}_to_${dateFilter.end_date}`
                        : '_custom'
                    : ''
                }`}
              />
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <MasterFilter
                visibleFilters={["date_filter", "username"]}
                initialFilters={{
                    date_filter: dateFilter,
                    username: selectedUser,
                    user_id: selectedUserId,
                }}
                
                onChange={handleFilterChange}
                onClear={handleClear}
                />

          </div>

          {/* Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
              </div>
            ) : stats.length > 0 ? (
            <div className="overflow-x-auto">
             <div className="max-h-80 overflow-y-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-black text-white/80 text-sm uppercase sticky top-0 z-20">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Master Posts</th>
                      <th className="px-4 py-2 text-left">Distributions</th>
                      <th className="px-4 py-2 text-left">Successful</th>
                      <th className="px-4 py-2 text-left">Failed</th>
                      <th className="px-4 py-2 text-left">Categories</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stats.map((user) => (
                      <tr
                        key={user.created_by_id}
                        onClick={() => handleUserClick(user)}
                        className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {formatUsername(user.created_by__username)}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{user.num_master_posts}</td>
                        <td className="px-4 py-2 text-gray-700">{user.num_total_distributions}</td>
                        <td className="px-4 py-2 text-green-600 font-semibold">{user.num_successful_distributions}</td>
                        <td className="px-4 py-2 text-red-600 font-semibold">{user.num_failed_distributions}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {user.assigned_master_categories?.length
                            ? user.assigned_master_categories.join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === 1
                          ? "bg-gray-200 text-gray-400"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === totalPages
                          ? "bg-gray-200 text-gray-400"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No data found.
              </div>
            )}
          </div>
          {showDetailPanel && selectedUserDetail && (
            <UserDetailPanel
              userId={selectedUserDetail.id}
              username={selectedUserDetail.name}
              onClose={handleClosePanel}
              range={dateFilter}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default UserStats;