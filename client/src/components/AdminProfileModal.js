import React from "react";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
};

const InfoRow = ({ label, value, copyable }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-900 text-right max-w-xs break-words flex items-center gap-2">
      {value || <span className="italic text-gray-400">Not provided</span>}
      {copyable && value && (
        <button
          className="ml-1 text-indigo-500 hover:text-indigo-700 focus:outline-none text-xs border border-indigo-200 rounded px-1 py-0.5"
          title={`Copy ${label.toLowerCase()}`}
          onClick={() => copyToClipboard(value)}
        >
          Copy
        </button>
      )}
    </span>
  </div>
);

const StatusBadge = ({ isActive }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
    {isActive ? "Active" : "Inactive"}
  </span>
);

const AdminProfileModal = ({ admin, onClose }) => {
  if (!admin) return null;
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackgroundClick}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up border border-gray-200 focus:outline-none" tabIndex={0}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close dashboard"
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-2 border-2 border-indigo-300">
            {getInitials(admin.username)}
          </div>
          <h2 className="text-2xl font-bold text-indigo-700 mb-1">Admin Profile</h2>
        </div>
        <hr className="my-4 border-gray-200" />
        <div className="space-y-2">
          <InfoRow label="Username" value={admin.username} copyable />
          <InfoRow label="Email" value={admin.email} copyable />
          <InfoRow label="Role" value={admin.role} />
          <div className="flex items-center justify-between py-2">
            <span className="font-semibold text-gray-600">Status</span>
            <StatusBadge isActive={admin.is_active} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal; 