import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContextStore';
import { getNotes, createNote, deleteNote } from '../api/notes';
import NoteCard from '../components/NoteCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
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
      setNotes((prev) => [res.data, ...prev]);
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

  if (loading) return <div>Loading notes...</div>;

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={logout}>Logout</button>
      <button onClick={handleCreate}>+ New Note</button>

      <div>
        {notes.length === 0 && <p>No notes yet. Create one!</p>}
        {notes.map((note) => (
          <NoteCard key={note._id} note={note} onClick={handleOpenNote} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;