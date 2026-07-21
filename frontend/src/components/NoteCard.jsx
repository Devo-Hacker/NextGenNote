import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Sparkles, Pencil, Trash2 } from 'lucide-react';

const NoteCard = ({ note, onClick, onEdit, onDeleteRequest }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div
      onClick={() => onClick(note)}
      className="relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{note.title || 'Untitled'}</h3>
          {note.isAIGenerated && (
            <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <Sparkles size={12} />
              AI
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-4">
          {note.content || 'No content yet...'}
        </p>
        {note.mood && (
          <span className="text-xs text-gray-400 mt-1 block">{note.mood}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{timeAgo(note.updatedAt)}</span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-7 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(note);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDeleteRequest(note);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;