import React from "react";

//
// ErrorAlert Component
// --------------------
// This component displays an error message inside a modal-style popup.
// It appears centered on the screen and darkens the background when visible.
// The component is completely controlled by its parent through props.
//
type ErrorAlertProps = {
  // Determines whether the alert is visible.
  // When false, the component returns null and renders nothing.
  isOpen: boolean;

  // The error message that will be displayed to the user.
  message: string;

  // Function triggered when the user clicks the "Close" button.
  // This allows the parent component to hide the alert by setting isOpen = false.
  onClose: () => void;
};

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  isOpen,
  message,
  onClose,
}) => {

  // If the alert is not open, do not render anything.
  // Returning null prevents unnecessary HTML from entering the DOM.
  if (!isOpen) return null;

  return (
    // Full-screen semi-transparent background overlay
    // Covers the entire viewport (`fixed inset-0`)
    // Darkens the screen behind the popup (`bg-black bg-opacity-50`)
    // Centers the alert both vertically and horizontally (`flex items-center justify-center`)
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center flex flex-col items-center gap-4">
        <p className="text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="search-btn text-white px-4 py-2 rounded text-sm shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
};
