import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Share2, Grid3x3, List, MoreHorizontal, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import { getNotes, createNote, deleteNote } from '../api/notes';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NewNoteCard from '../components/NewNoteCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const handleOpenNote = (note) => {
    navigate(`/notes/${note._id}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Topbar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">NextGenNote</h1>
            <div className="flex items-center gap-2">
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
              <NewNoteCard onClick={handleCreate} />
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onClick={handleOpenNote}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;