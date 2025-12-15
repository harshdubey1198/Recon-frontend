import React from "react";
import { Calendar } from "lucide-react";

const EventDetailsSection = ({ formData, handleInputChange }) => {
  return (
    <section className="space-y-5 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
      <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <span>Event Details</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time</label>
          <input
            type="datetime-local"
            name="eventStartDate"
            value={formData.eventStartDate}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time</label>
          <input
            type="datetime-local"
            name="eventEndDate"
            value={formData.eventEndDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
