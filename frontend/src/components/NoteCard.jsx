import { MoreVertical, Sparkles } from 'lucide-react';

const NoteCard = ({ note, onClick, onDelete }) => {
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
      className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between min-h-[220px]"
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
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{timeAgo(note.updatedAt)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;