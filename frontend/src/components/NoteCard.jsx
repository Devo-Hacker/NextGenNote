import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Sparkles, Pencil, Trash2, Pin, Archive, RotateCcw } from 'lucide-react';

const NoteCard = ({ note, view, onClick, onEdit, onPin, onArchive, onRestore, onDeleteRequest }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
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

  const close = (fn) => (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    fn(note);
  };

  return (
    <div
      onClick={() => onClick(note)}
      className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{note.title || 'Untitled'}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {note.isPinned && <Pin size={12} className="text-amber-500 fill-amber-500" />}
            {note.isAIGenerated && (
              <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                <Sparkles size={12} />
                AI
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-4">{note.content || 'No content yet...'}</p>
        {note.mood && <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">{note.mood}</span>}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(note.updatedAt)}</span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40 z-10">
              {view !== 'trash' && view !== 'archive' && (
                <>
                  <MenuItem icon={<Pencil size={14} />} label="Edit" onClick={close(onEdit)} />
                  <MenuItem icon={<Pin size={14} />} label={note.isPinned ? 'Unpin' : 'Pin'} onClick={close(onPin)} />
                  <MenuItem icon={<Archive size={14} />} label="Archive" onClick={close(onArchive)} />
                </>
              )}
              {(view === 'trash' || view === 'archive') && (
                <MenuItem icon={<RotateCcw size={14} />} label="Restore" onClick={close(onRestore)} />
              )}
              <MenuItem
                icon={<Trash2 size={14} />}
                label={view === 'trash' ? 'Delete forever' : 'Delete'}
                danger
                onClick={close(onDeleteRequest)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
      danger ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default NoteCard;