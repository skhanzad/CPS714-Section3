import React from "react";
import { FaCheckCircle } from "react-icons/fa";

//
// ModalProps
// -----------
// Defines the properties that control the behavior and content of the Modal.
//
type ModalProps = {
  isOpen: boolean; // Controls whether the modal is visible
  title?: string; // Optional title displayed at the top of the modal
  message: string; // Main message/content displayed in the modal
  onClose: () => void; // Callback triggered when user clicks the close button
};

//
// Modal Component
// ----------------
// Displays a modal dialog with a semi-transparent backdrop.
// Typically used to show success messages or confirmations.
//
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {

  // If modal is not open, render nothing (prevents DOM clutter)
  if (!isOpen) return null;

  return (
    // Full-screen darkened overlay
    // - Covers entire viewport (fixed inset-0)
    // - Semi-transparent black background (bg-opacity-50)
    // - Flexbox centers modal content vertically and horizontally
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">

      {/* 
        Modal content box
        - White background with rounded corners
        - Shadow for depth
        - Fixed height & width
        - Flex layout centers content vertically
      */}
      <div className="bg-white rounded-lg p-6 h-80 w-96 shadow-lg text-center flex flex-col items-center justify-center ">

        {/* Success icon */}
        <FaCheckCircle className="text-5xl text-lime-600" />

        {/* Optional title, rendered only if provided */}
        {title && <h2 className="text-lg font-semibold">{title}</h2>}

        {/* Main message */}
        <p className="font-semibold mt-4">{message}</p>

        {/* Additional instruction text */}
        <p className="mb-4 text-sm">
          {" "}
          Please check your email for confirmation and further instructions.
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="search-btn text-white px-4 py-2 rounded shadow"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
};
