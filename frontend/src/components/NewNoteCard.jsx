import { Plus } from 'lucide-react';

const NewNoteCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="border-2 border-dashed border-gray-200 rounded-xl min-h-[220px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
  >
    <Plus size={20} />
    <span className="text-sm">New note</span>
  </button>
);

export default NewNoteCard;