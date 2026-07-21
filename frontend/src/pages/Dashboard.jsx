import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Sparkles, Trash2 } from "lucide-react";
import { AuthContext } from "../context/AuthContextStore";
import {
  getNotes,
  getNoteCounts,
  createNote,
  togglePinNote,
  archiveNote,
  restoreNote,
  deleteNote,
  hardDeleteNote,
  emptyTrash,
} from "../api/notes";
import { getMe } from "../api/user";
import {
  getCollections,
  createCollection,
  setNoteCollection,
  deleteCollection,
} from "../api/collections";
import Sidebar from "../components/Sidebar";
import NoteCard from "../components/NoteCard";
import NewNoteCard from "../components/NewNoteCard";
import AICanvas from "../components/AICanvas";
import ConfirmDialog from "../components/ConfirmDialog";
import ProfileMenu from "../components/ProfileMenu";
import {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
} from "../api/notifications";
import NotificationPanel from "../components/NotificationPanel";
import CollectionModal from "../components/CollectionModal";

const RECENT_KEY = "recentNotes";
const loadRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
};

const VIEW_LABELS = {
  all: "All Notes",
  starred: "Starred",
  archive: "Archive",
  trash: "Trash",
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [counts, setCounts] = useState({ starred: 0, archive: 0, trash: 0 });
  const [activeView, setActiveView] = useState("all");
  const [loading, setLoading] = useState(true);
  const [aiCanvasOpen, setAiCanvasOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [recentNotes, setRecentNotes] = useState(loadRecent);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [greeting, setGreeting] = useState("Hola");
  const [collections, setCollections] = useState([]);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async (view) => {
    setLoading(true);
    try {
      const params = view.startsWith("collection:")
        ? { collectionId: view.replace("collection:", "") }
        : { filter: view };
      const res = await getNotes(params);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await getNoteCounts();
      setCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch counts", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const fetchGreeting = async () => {
    try {
      const res = await getMe();
      setGreeting(res.data.dashboardGreeting);
    } catch (err) {
      console.error("Failed to fetch greeting", err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await getCollections();
      setCollections(res.data);
    } catch (err) {
      console.error("Failed to fetch collections", err);
    }
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection(collectionToDelete._id);
      if (activeView === `collection:${collectionToDelete._id}`) {
        setActiveView("all");
      }
      await fetchCollections();
      refresh();
    } catch (err) {
      console.error("Failed to delete collection", err);
    } finally {
      setCollectionToDelete(null);
    }
  };

  const refresh = () => {
    fetchNotes(activeView);
    fetchCounts();
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotes(activeView);
    fetchCounts();
    fetchNotifications();
  }, [activeView]);

  useEffect(() => {
    fetchGreeting();
    fetchCollections();
  }, []);

  const addToRecent = (note) => {
    setRecentNotes((prev) => {
      const filtered = prev.filter((n) => n._id !== note._id);
      const updated = [{ _id: note._id, title: note.title }, ...filtered].slice(
        0,
        5,
      );
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreate = async () => {
    try {
      const res = await createNote({ title: "Untitled", content: "" });
      navigate(`/notes/${res.data._id}`);
    } catch (err) {
      console.error("Failed to create note", err);
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
      if (activeView === "trash") {
        await hardDeleteNote(noteToDelete._id);
      } else {
        await deleteNote(noteToDelete._id);
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    } finally {
      setNoteToDelete(null);
      refresh();
    }
  };

  const confirmEmptyTrash = async () => {
    try {
      await emptyTrash();
    } catch (err) {
      console.error("Failed to empty trash", err);
    } finally {
      setEmptyTrashOpen(false);
      refresh();
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const handleCreateCollection = async (data) => {
    try {
      await createCollection(data);
      await fetchCollections();
      setCollectionModalOpen(false);
      refresh();
    } catch (err) {
      console.error("Failed to create collection", err);
    }
  };

  const handleMoveToCollection = async (note, collectionId) => {
    try {
      await setNoteCollection(note._id, collectionId);
      refresh();
    } catch (err) {
      console.error("Failed to move note to collection", err);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCollection = activeView.startsWith("collection:")
    ? collections.find((c) => c._id === activeView.replace("collection:", ""))
    : null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        counts={counts}
        recentNotes={recentNotes}
        onOpenRecent={handleOpenNote}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        notificationCount={notifications.length}
        onNotificationsClick={() => setNotificationsOpen((prev) => !prev)}
        collections={collections}
        onNewWorkspace={() => setCollectionModalOpen(true)}
        onDeleteCollection={setCollectionToDelete}
      />

      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onDelete={handleDeleteNotification}
        onClearAll={handleClearAllNotifications}
        positionClass={collapsed ? "left-[80px]" : "left-[272px]"}
      />

      <main className="flex-1 overflow-y-auto relative bg-[#0a0a10]">
        <style>{`
          .neon-glass-grid {
            background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
            background-size: 18px 18px;
          }
          .neon-glass-panel {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
          }
          .neon-glass-search {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }
          .neon-ai-btn {
            background: linear-gradient(135deg, #a855f7 0%, #6d28d9 100%);
            box-shadow: 0 4px 14px rgba(147, 51, 234, 0.35);
          }
        `}</style>

        <div className="absolute inset-0 neon-glass-grid pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">
              {activeCollection
                ? activeCollection.name
                : VIEW_LABELS[activeView]}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAiCanvasOpen((prev) => !prev)}
                className="neon-ai-btn flex items-center gap-1.5 text-sm text-white rounded-lg px-3 py-1.5 transition-transform active:scale-95"
              >
                <Sparkles size={14} />
                AI Canvas
              </button>
              <ProfileMenu />
            </div>
          </div>

          <p className="text-gray-400 mb-4">
            {greeting} {user?.name} 👋
          </p>

          <div className="neon-glass-search flex items-center gap-2 rounded-xl px-4 py-3 mb-6">
            <Search size={16} className="text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search something or use AI"
              className="flex-1 outline-none text-sm text-white bg-transparent placeholder-gray-500"
            />
            <Clock size={16} className="text-gray-500" />
          </div>

          {activeView === "trash" && counts.trash > 0 && (
            <button
              onClick={() => setEmptyTrashOpen(true)}
              className="flex items-center gap-1.5 text-sm text-red-400 border border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-950/40 mb-6"
            >
              <Trash2 size={14} />
              Permanently delete all
            </button>
          )}

          {loading ? (
            <p className="text-gray-500">Loading notes...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeView === "all" && !searchQuery && (
                <NewNoteCard onClick={handleCreate} />
              )}
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  view={activeView}
                  accentColor={activeCollection?.color}
                  collections={collections}
                  onClick={handleOpenNote}
                  onEdit={handleOpenNote}
                  onPin={handlePin}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDeleteRequest={setNoteToDelete}
                  onMoveToCollection={handleMoveToCollection}
                />
              ))}
              {filteredNotes.length === 0 && (
                <p className="text-gray-500 text-sm col-span-full text-center py-8">
                  {searchQuery
                    ? `No notes match "${searchQuery}"`
                    : `Nothing in ${activeCollection ? activeCollection.name : VIEW_LABELS[activeView]} yet`}
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
        title={activeView === "trash" ? "Delete forever?" : "Move to trash?"}
        message={
          activeView === "trash"
            ? `"${noteToDelete?.title || "Untitled"}" will be permanently deleted. This can't be undone.`
            : `"${noteToDelete?.title || "Untitled"}" will be moved to Trash.`
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

      <CollectionModal
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onCreate={handleCreateCollection}
      />

      <ConfirmDialog
        isOpen={!!collectionToDelete}
        title="Delete collection?"
        message={`"${collectionToDelete?.name}" will be deleted. Notes inside it won't be deleted, just unassigned.`}
        onConfirm={confirmDeleteCollection}
        onCancel={() => setCollectionToDelete(null)}
      />
    </div>
  );
};

export default Dashboard;