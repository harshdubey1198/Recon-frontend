import React from "react";
import { Star, Clock, FileText, TrendingUp, AlertCircle, Calendar } from "lucide-react";

const PublishingOptionsSection = ({ formData, handleInputChange }) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Star className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Publishing Options</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: "latestNews", label: "Latest News", icon: Clock },
          { key: "headlines", label: "Headlines", icon: FileText },
          { key: "articles", label: "Articles", icon: FileText },
          { key: "trending", label: "Trending", icon: TrendingUp },
          { key: "breakingNews", label: "Breaking News", icon: AlertCircle },
          { key: "upcomingEvents", label: "Upcoming Events", icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <label
            key={key}
            className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
              formData[key] ? "bg-gray-900 border-gray-900 text-white shadow-lg" : "bg-white border-gray-300 hover:border-gray-400"
            }`}
          >
            <input type="checkbox" name={key} checked={formData[key]} onChange={handleInputChange} className="w-5 h-5 rounded accent-gray-900" />
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

export default PublishingOptionsSection;