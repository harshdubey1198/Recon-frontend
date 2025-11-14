import React, { useRef, useCallback, useState } from 'react';
import { Users } from 'lucide-react';
import formatUsername from '../../utils/formateName';

export default function TopContributors({ contributors = [], itemsPerPage = 8 }) {
  const [contributorsPage, setContributorsPage] = useState(1);
  const contributorsRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!contributorsRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contributorsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setContributorsPage(prev => {
        const maxPage = Math.ceil(contributors.length / itemsPerPage);
        return prev < maxPage ? prev + 1 : prev;
      });
    }
  }, [contributors.length, itemsPerPage]);

  return (
    <div className="bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-md">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <div className="p-2 bg-black rounded-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Contributors</h3>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {contributors?.length > 0 ? (
          <div 
            ref={contributorsRef}
            onScroll={handleScroll}
            className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#181717ff'
            }}
          >
            {contributors.slice(0, contributorsPage * itemsPerPage).map((user, idx) => (
              <div key={idx} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {user.news_post__created_by__username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {formatUsername(user.news_post__created_by__username || 'Unknown User')}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Contributor</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-lg sm:text-2xl font-bold text-orange-600">{user.total_distributions || 0}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">articles</p>
                  </div>
                </div>
              </div>
            ))}
            {contributorsPage * itemsPerPage < contributors.length && (
              <div className="text-center py-2">
                <p className="text-xs text-gray-500">Scroll for more...</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs sm:text-sm text-center py-8">No contributors found.</p>
        )}
      </div>
    </div>
  );
}