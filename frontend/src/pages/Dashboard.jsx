import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Sparkles, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import {
  getNotes, getNoteCounts, createNote,
  togglePinNote, archiveNote, restoreNote,
  deleteNote, hardDeleteNote, emptyTrash,
} from '../api/notes';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NewNoteCard from '../components/NewNoteCard';
import AICanvas from '../components/AICanvas';
import ConfirmDialog from '../components/ConfirmDialog';
import ProfileMenu from '../components/ProfileMenu';

const RECENT_KEY = 'recentNotes';
const loadRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

const VIEW_LABELS = { all: 'All Notes', starred: 'Starred', archive: 'Archive', trash: 'Trash' };

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [counts, setCounts] = useState({ starred: 0, archive: 0, trash: 0 });
  const [activeView, setActiveView] = useState('all');
  const [loading, setLoading] = useState(true);
  const [aiCanvasOpen, setAiCanvasOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [recentNotes, setRecentNotes] = useState(loadRecent);
  const navigate = useNavigate();

  const fetchNotes = async (view) => {
    setLoading(true);
    try {
      const res = await getNotes(view);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await getNoteCounts();
      setCounts(res.data);
    } catch (err) {
      console.error('Failed to fetch counts', err);
    }
  };

  const refresh = () => {
    fetchNotes(activeView);
    fetchCounts();
  };

  useEffect(() => {
    fetchNotes(activeView);
    fetchCounts();
  }, [activeView]);

  const addToRecent = (note) => {
    setRecentNotes((prev) => {
      const filtered = prev.filter((n) => n._id !== note._id);
      const updated = [{ _id: note._id, title: note.title }, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreate = async () => {
    try {
      const res = await createNote({ title: 'Untitled', content: '' });
      navigate(`/notes/${res.data._id}`);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleOpenNote = (note) => {
    addToRecent(note);
    navigate(`/notes/${note._id}`);
  };

  const handleAINoteSaved = (note) => {
    refresh();
    setAiCanvasOpen(false);
  };

  const handlePin = async (note) => {
    await togglePinNote(note._id);
    refresh();
  };

  const handleArchive = async (note) => {
    await archiveNote(note._id);
    refresh();
  };

  const handleRestore = async (note) => {
    await restoreNote(note._id);
    refresh();
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      if (activeView === 'trash') {
        await hardDeleteNote(noteToDelete._id);
      } else {
        await deleteNote(noteToDelete._id);
      }
    } catch (err) {
      console.error('Failed to delete note', err);
    } finally {
      setNoteToDelete(null);
      refresh();
    }
  };

  const confirmEmptyTrash = async () => {
    try {
      await emptyTrash();
    } catch (err) {
      console.error('Failed to empty trash', err);
    } finally {
      setEmptyTrashOpen(false);
      refresh();
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        counts={counts}
        recentNotes={recentNotes}
        onOpenRecent={handleOpenNote}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{VIEW_LABELS[activeView]}</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAiCanvasOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm text-white bg-purple-600 rounded-lg px-3 py-1.5 hover:bg-purple-700"
              >
                <Sparkles size={14} />
                AI Canvas
              </button>
              <ProfileMenu />
            </div>
          </div>

          <p className="text-gray-500 mb-4">Hola {user?.name} 👋</p>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
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

          {activeView === 'trash' && counts.trash > 0 && (
            <button
              onClick={() => setEmptyTrashOpen(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 mb-6"
            >
              <Trash2 size={14} />
              Permanently delete all
            </button>
          )}

          {loading ? (
            <p className="text-gray-400">Loading notes...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeView === 'all' && !searchQuery && <NewNoteCard onClick={handleCreate} />}
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  view={activeView}
                  onClick={handleOpenNote}
                  onEdit={handleOpenNote}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDeleteRequest={setNoteToDelete}
                />
              ))}
              {filteredNotes.length === 0 && (
                <p className="text-gray-400 text-sm col-span-full text-center py-8">
                  {searchQuery ? `No notes match "${searchQuery}"` : `Nothing in ${VIEW_LABELS[activeView]} yet`}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <AICanvas isOpen={aiCanvasOpen} onClose={() => setAiCanvasOpen(false)} onNoteSaved={handleAINoteSaved} />

      <ConfirmDialog
        isOpen={!!noteToDelete}
        title={activeView === 'trash' ? 'Delete forever?' : 'Move to trash?'}
        message={
          activeView === 'trash'
            ? `"${noteToDelete?.title || 'Untitled'}" will be permanently deleted. This can't be undone.`
            : `"${noteToDelete?.title || 'Untitled'}" will be moved to Trash.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />

      <ConfirmDialog
        isOpen={emptyTrashOpen}
        title="Empty trash?"
        message={`All ${counts.trash} note(s) in Trash will be permanently deleted. This can't be undone.`}
        onConfirm={confirmEmptyTrash}
        onCancel={() => setEmptyTrashOpen(false)}
      />
    </div>
  );
};

export default Dashboard;