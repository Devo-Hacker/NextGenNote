import { useState } from 'react';
import { X, Check } from 'lucide-react';

const AddNotesToCollectionModal = ({ isOpen, onClose, availableNotes, onConfirm, collectionName }) => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleConfirm = async () => {
    await onConfirm(selected);
    setSelected([]);
    setSearch('');
  };

  const filtered = availableNotes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add notes to "{collectionName}"</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-purple-400 mb-3"
        />

        <div className="max-h-56 overflow-y-auto space-y-1 mb-4">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1 py-2">No notes available to add</p>
          )}
          {filtered.map((n) => (
            <button
              key={n._id}
              onClick={() => toggle(n._id)}
              className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected.includes(n._id)
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="truncate">{n.title || 'Untitled'}</span>
              {selected.includes(n._id) && <Check size={14} />}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="text-sm font-medium text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Add {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotesToCollectionModal;