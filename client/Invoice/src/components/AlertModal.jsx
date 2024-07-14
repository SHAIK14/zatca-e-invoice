// AlertModal.js
// eslint-disable-next-line no-unused-vars
import React from "react";

// eslint-disable-next-line react/prop-types
const AlertModal = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <p className="text-lg text-center mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
