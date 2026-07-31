import { useState, useRef, useEffect } from 'react';
import { ChevronRight, MoreVertical, Sparkles, Pencil, Trash2, Pin, Archive, RotateCcw } from 'lucide-react';
import { blocksToPlainText } from '../utils/noteContent';
import BlockViewer from './BlockViewer';

const NoteBar = ({ note, view, accentColor = null, onEdit, onPin, onArchive, onRestore, onDeleteRequest }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const hasColor = Boolean(accentColor);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Measure content height whenever it's expanded or the note content changes,
  // so the collapse/expand transition animates to the correct height rather than
  // jumping instantly or animating to 0/auto (which CSS can't transition natively).
  useEffect(() => {
    if (expanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, note.content]);

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  const close = (fn) => (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    fn(note);
  };

  return (
    <div
      style={hasColor ? { borderLeftColor: accentColor, borderLeftWidth: '3px' } : { borderLeftWidth: '3px' }}
      className={`relative bg-white dark:bg-[#000012] border border-gray-200 dark:border-white/5 rounded-xl overflow-visible transition-colors ${
        hasColor ? '' : 'border-l-gray-300 dark:border-l-white/90'
      }`}
    >
      {/* Bar header — always visible */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-1 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            style={hasColor ? { backgroundColor: `${accentColor}26` } : undefined}
            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
              hasColor ? '' : 'bg-gray-200 dark:bg-white/12 dark:shadow-[0_0_6px_rgba(255,255,255,0.8),0_0_12px_rgba(255,255,255,0.4)]'
            }`}
          >
            <ChevronRight
              size={12}
              style={hasColor ? { color: accentColor } : undefined}
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''} ${
                hasColor ? '' : 'text-gray-700 dark:text-white dark:drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]'
              }`}
            />
          </span>
          {note.isPinned && <Pin size={12} className="shrink-0 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />}
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {note.title || 'Untitled'}
          </span>
          {note.isAIGenerated && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/15 px-2 py-0.5 rounded-full">
              <Sparkles size={10} />
              AI
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(note.updatedAt)}</span>
          <div className="relative" ref={menuRef}>
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev); }}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 -m-1 rounded"
            >
              <MoreVertical size={16} />
            </span>

            {menuOpen && (
              <div className="absolute right-0 top-7 bg-white dark:bg-[#232328] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 w-40 z-50">
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
      </button>

      {/* Expanded content — animated height, scrollable inside once open */}
      <div
  style={{ maxHeight: expanded ? contentHeight : 0 }}
  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
>
        <div ref={contentRef} className="px-4 pb-4 border-t border-gray-100 dark:border-white/5">
          <div className="max-h-64 overflow-y-auto mt-3 pr-1">
            <BlockViewer
              content={note.content}
              textColorClass="text-gray-600 dark:text-gray-400 text-sm"
              mutedColorClass="text-gray-400 dark:text-gray-500 text-sm"
            />
          </div>
          {note.mood && (
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block">{note.mood}</span>
          )}
          <button
            onClick={() => onEdit(note)}
            style={hasColor ? { color: accentColor } : undefined}
            className={`mt-3 flex items-center gap-1.5 text-xs font-medium hover:underline ${
              hasColor ? '' : 'text-gray-800 dark:text-white dark:[text-shadow:0_0_6px_rgba(255,255,255,0.7)]'
            }`}
          >
            <Pencil size={12} />
            Open full editor
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${
      danger ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default NoteBar;