import { useRef, useEffect } from 'react';
import { X, Trash2, Bell } from 'lucide-react';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationPanel = ({ isOpen, onClose, notifications, onDelete, onClearAll, positionClass }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed ${positionClass} top-24 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-30 flex flex-col max-h-[70vh]`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-300">
            <Bell size={24} />
            <p className="text-sm mt-2">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className="flex items-start justify-between gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              <button
                onClick={() => onDelete(n._id)}
                className="text-gray-300 hover:text-red-500 shrink-0 mt-0.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <button
          onClick={onClearAll}
          className="text-sm text-red-500 hover:bg-red-50 py-2.5 border-t border-gray-100"
        >
          Clear all notifications
        </button>
      )}
    </div>
  );
};

export default NotificationPanel;