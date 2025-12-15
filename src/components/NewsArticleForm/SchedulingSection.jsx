import React from "react";
import { Clock } from "lucide-react";

const SchedulingSection = ({ formData, handleInputChange }) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Clock className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Scheduling & Settings</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Date</label>
          <input
            type="datetime-local"
            name="scheduleDate"
            value={formData.scheduleDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Counter</label>
          <input
            type="number"
            name="counter"
            value={formData.counter}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="0"
          />
        </div>
      </div>
    </section>
  );
};

export default SchedulingSection;
