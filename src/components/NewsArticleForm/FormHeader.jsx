import React from "react";
import { FileText, RefreshCw, Save, SaveAll } from "lucide-react";

const FormHeader = ({ distId, handleViewDrafts, resetForm, handleSubmit, isLoading, isDistributedEdit }) => {
  return (
    <div className="bg-black px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {distId ? "Update News Article" : "Create News Article"}
            </h1>
            <p className="text-gray-300 text-sm">Fill in the details to publish your article</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button type="button" onClick={handleViewDrafts} className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20">
            <FileText className="w-4 h-4" />
            <span>View Drafts</span>
          </button>
          <button type="button" onClick={resetForm} className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20">
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <div className="flex space-x-2">
            {!isDistributedEdit && (
              <button type="button" disabled={isLoading} onClick={(e) => handleSubmit(e, "DRAFT")} className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg">
                <SaveAll className="w-4 h-4 mr-2" />
                Save as Draft
              </button>
            )}
            <button type="submit" disabled={isLoading} onClick={(e) => handleSubmit(e, "PUBLISHED")} className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {distId ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {distId ? "Update & Publish" : "Publish Article"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;