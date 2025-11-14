import React from "react";
import { FileText } from "lucide-react";

const DraftsModal = ({ show, drafts, onClose, onSelectDraft }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          Select a Draft to Edit
        </h2>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {drafts.length > 0 ? (
            drafts.map((draft) => (
              <div
                key={draft.id}
                onClick={() => onSelectDraft(draft)}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer transition"
              >
                <p className="font-medium text-gray-800">{draft.title}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(draft.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  Status: {draft.status}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No drafts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DraftsModal);