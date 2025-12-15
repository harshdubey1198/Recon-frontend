import React from "react";
import { SaveAll, Save } from "lucide-react";

const FormActions = ({ resetForm, isLoading, handleSubmit, isDistributedEdit }) => {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-200">
      <button
        type="button"
        onClick={resetForm}
        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
      >
        Reset Form
      </button>

      {!isDistributedEdit && (
        <button
          type="button"
          disabled={isLoading}
          onClick={(e) => handleSubmit(e, "DRAFT")}
          className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
        >
          <SaveAll className="w-4 h-4 mr-2" />
          Save as Draft
        </button>
      )}

      <button
        type="button"
        disabled={isLoading}
        onClick={(e) => handleSubmit(e, "PUBLISHED")}
        className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isDistributedEdit ? "Updating..." : "Publishing..."}
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            {isDistributedEdit ? "Update & Publish" : "Publish Article"}
          </>
        )}
      </button>
    </div>
  );
};

export default FormActions;