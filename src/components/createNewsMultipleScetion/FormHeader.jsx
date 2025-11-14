import React from "react";
import { FileText, RefreshCw } from "lucide-react";

const FormHeader = ({ onReset, onViewDrafts }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create News Article</h1>
            <p className="text-gray-300 text-sm">Fill in the details to publish your article</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onViewDrafts}
            className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20"
          >
            <FileText className="w-4 h-4" />
            <span>View Drafts</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FormHeader);