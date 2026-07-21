import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Share2, Grid3x3, List, MoreHorizontal, Clock, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import { getNotes, createNote, deleteNote } from '../api/notes';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NewNoteCard from '../components/NewNoteCard';
import AICanvas from '../components/AICanvas';
import ConfirmDialog from '../components/ConfirmDialog';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiCanvasOpen, setAiCanvasOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await createNote({ title: 'Untitled', content: '' });
      navigate(`/notes/${res.data._id}`);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete._id);
      setNotes((prev) => prev.filter((n) => n._id !== noteToDelete._id));
    } catch (err) {
      console.error('Failed to delete note', err);
    } finally {
      setNoteToDelete(null);
    }
  };

  const handleOpenNote = (note) => {
    navigate(`/notes/${note._id}`);
  };

  const handleAINoteSaved = (note) => {
    setNotes((prev) => [note, ...prev]);
    setAiCanvasOpen(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Topbar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">NextGenNote</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiCanvasOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm text-white bg-purple-600 rounded-lg px-3 py-1.5 hover:bg-purple-700"
              >
                <Sparkles size={14} />
                AI Canvas
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100">
                <Share2 size={14} />
                Share
              </button>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button className="p-2 bg-gray-900 text-white">
                  <Grid3x3 size={14} />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100">
                  <List size={14} />
                </button>
              </div>
              <button className="p-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <p className="text-gray-500 mb-4">Hola {user?.name} 👋</p>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-8">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search something or use AI"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <Clock size={16} className="text-gray-400" />
          </div>

          {/* Notes grid */}
          {loading ? (
            <p className="text-gray-400">Loading notes...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!searchQuery && <NewNoteCard onClick={handleCreate} />}
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={handleOpenNote}
                  onEdit={handleOpenNote}
                  onDeleteRequest={setNoteToDelete}
                />
              ))}
              {filteredNotes.length === 0 && searchQuery && (
                <p className="text-gray-400 text-sm col-span-full text-center py-8">
                  No notes match "{searchQuery}"
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <AICanvas
        isOpen={aiCanvasOpen}
        onClose={() => setAiCanvasOpen(false)}
        onNoteSaved={handleAINoteSaved}
      />

      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete note?"
        message={`"${noteToDelete?.title || 'Untitled'}" will be permanently deleted. This can't be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};

export default Dashboard;