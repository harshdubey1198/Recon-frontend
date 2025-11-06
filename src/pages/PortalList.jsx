import React, { useState, useEffect, useRef } from "react";
import { Globe, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import PortalDetailPanel from "../components/PortalDetailPanel";
import { toast } from "react-toastify";
import { fetchPortals } from "../../server";

export default function PortalList() {
  const [portals, setPortals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Detail Panel
  const [selectedPortal, setSelectedPortal] = useState(null);

  // Fetch portals
  const loadPortals = async (pageNum = 1) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetchPortals(pageNum);
      const api = res.data;

      if (api.status && Array.isArray(api.data)) {
        setPortals(api.data);
        if (api.pagination) {
          setPage(api.pagination.page);
          setTotalPages(api.pagination.total_pages);
          setHasNext(!!api.pagination.next);
          setHasPrevious(!!api.pagination.previous);
        }
      } else {
        toast.error("Failed to load portal list.");
      }
    } catch (err) {
      console.error("Error loading portals:", err);
      toast.error("Server error while fetching portals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortals(1);
  }, []);

  // Infinite scroll
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 50;

    if (atBottom && hasNext) {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        loadPortals(page + 1);
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Portal List
            </h1>
            <p className="text-gray-600">
              View and manage all registered publishing portals
            </p>
          </div>
        </div>

        {/* Loader Overlay */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-40">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading portals...</span>
            </div>
          </div>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {portals.map((portal) => (
              <div
                key={portal.id}
                onClick={() =>
                  setSelectedPortal({ id: portal.id, name: portal.name })
                }
                className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Globe className="text-gray-900" size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white truncate max-w-[160px]">
                        {portal.name || "Unnamed Portal"}
                      </h2>
                      <p className="text-gray-300 text-xs">
                        {portal.domain || portal.base_url || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 text-sm text-gray-700">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">Base URL: </span>
                    {portal.base_url || portal.domain || "N/A"}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <span className="font-semibold text-gray-900">Status: </span>
                    {portal.status?.toUpperCase?.() || "ACTIVE"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="text-center text-gray-500 text-sm py-4">
            {hasNext ? "Scroll down to load more..." : "End of list"}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 gap-3">
          <button
            onClick={() => hasPrevious && loadPortals(page - 1)}
            disabled={!hasPrevious}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              hasPrevious
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            <ArrowLeft size={16} />
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => hasNext && loadPortals(page + 1)}
            disabled={!hasNext}
            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              hasNext
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Portal Detail Panel */}
      {selectedPortal && (
        <PortalDetailPanel
          portalId={selectedPortal.id}
          portalName={selectedPortal.name}
          onClose={() => setSelectedPortal(null)}
        />
      )}
    </div>
  );
}
