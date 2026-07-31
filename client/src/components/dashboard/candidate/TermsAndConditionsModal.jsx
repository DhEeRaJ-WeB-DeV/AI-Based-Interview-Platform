import { useState, useRef } from 'react';
import termsAndConditions from './hooks/TermsAndConditions';
import { X } from "lucide-react";

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const contentRef = useRef(null);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const scrolledToBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    if (scrolledToBottom) setHasScrolledToEnd(true);
  };

  const handleClose = () => {
    setAgreed(false);
    setHasScrolledToEnd(false);
    onClose();
  };

  const handleAccept = () => {
    if (onAccept) onAccept();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <div>
            <div className="text-lg font-semibold text-gray-900 leading-none">
                Terms & Conditions
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Please review before continuing
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
           <div
            ref={contentRef}
            onScroll={handleScroll}
            className="px-6 py-5 overflow-y-auto scrollbar-hide"
            >
            <ul className="list-disc list-outside pl-5 space-y-3">
            {termsAndConditions.map((item, index) => (
                <li key={index} className="text-gray-500 text-sm leading-relaxed">
                {item}
                </li>
            ))}
            </ul>
           </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 space-y-4 bg-gray-50">
          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
            />
            I have read and agree to the Terms & Conditions
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!agreed}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}