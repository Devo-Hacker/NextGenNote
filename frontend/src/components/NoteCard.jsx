import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Sparkles, Pencil, Trash2, Pin, Archive, RotateCcw } from 'lucide-react';

const NoteCard = ({ note, view, accentColor, onClick, onEdit, onPin, onArchive, onRestore, onDeleteRequest }) => {
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
    if (diff < 172800) return 'Yesterday';
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  };

  const close = (fn) => (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    fn(note);
  };

  return (
    <div
      onClick={() => onClick(note)}
      style={accentColor ? { borderTopColor: accentColor, borderTopWidth: '3px' } : undefined}
      className="relative rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between min-h-[190px]
  bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg hover:shadow-purple-100
  dark:from-purple-950/40 dark:to-[#010002] dark:border-purple-500/30 dark:shadow-[0_0_8px_rgba(168,85,247,0.06)]
  dark:hover:shadow-[0_0_12px_rgba(168,85,247,0.18)] dark:hover:border-purple-400/50"
    >
      <div>
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white dark:[text-shadow:0_0_12px_rgba(216,180,254,0.5)]">
            {note.title || 'Untitled'}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {note.isPinned && (
              <Pin
                size={13}
                className="text-purple-500 fill-purple-500 dark:text-fuchsia-300 dark:fill-fuchsia-300"
                style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
              />
            )}
            {note.isAIGenerated && (
              <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-fuchsia-200 bg-purple-100 dark:bg-fuchsia-500/20 dark:border dark:border-fuchsia-400/30 px-2 py-0.5 rounded-full">
                <Sparkles size={12} />
                AI
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-purple-100/70 line-clamp-4">
          {note.content || 'No content yet...'}
        </p>
        {note.mood && <span className="text-xs text-purple-500 dark:text-fuchsia-300 mt-1 block">{note.mood}</span>}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-100 dark:border-purple-400/20">
        <span className="text-xs text-gray-400 dark:text-purple-300/60">{timeAgo(note.updatedAt)}</span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
            className="text-gray-400 dark:text-purple-300/70 hover:text-purple-600 dark:hover:text-fuchsia-200"
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