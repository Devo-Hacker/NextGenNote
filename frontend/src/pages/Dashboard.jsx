import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Trash2, FolderPlus, Pin, Plus, Calendar, Grid3x3 } from "lucide-react";
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
import AddNotesToCollectionModal from "../components/AddNotesToCollectionModal";

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
  const [addNotesModalOpen, setAddNotesModalOpen] = useState(false);
  const [allNotesForPicker, setAllNotesForPicker] = useState([]);
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

  const fetchAllNotesForPicker = async () => {
    try {
      const res = await getNotes({ filter: "all" });
      const currentCollId = activeView.replace("collection:", "");
      setAllNotesForPicker(res.data.filter((n) => n.collectionId !== currentCollId));
    } catch (err) {
      console.error("Failed to fetch notes for picker", err);
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
      const updated = [{ _id: note._id, title: note.title }, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreate = () => {
    const query = activeView.startsWith("collection:")
      ? `?collectionId=${activeView.replace("collection:", "")}`
      : "";
    navigate(`/notes/new${query}`);
  };

  const handleAddNotesToCollection = async (noteIds) => {
    const collId = activeView.replace("collection:", "");
    try {
      await Promise.all(noteIds.map((nid) => setNoteCollection(nid, collId)));
      setAddNotesModalOpen(false);
      refresh();
    } catch (err) {
      console.error("Failed to add notes to collection", err);
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const activeCollection = activeView.startsWith("collection:")
    ? collections.find((c) => c._id === activeView.replace("collection:", ""))
    : null;

  const renderCard = (note) => (
    <NoteCard
      key={note._id}
      note={note}
      view={activeView}
      accentColor={activeCollection?.color}
      onClick={handleOpenNote}
      onEdit={handleOpenNote}
      onPin={handlePin}
      onArchive={handleArchive}
      onRestore={handleRestore}
      onDeleteRequest={setNoteToDelete}
    />
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a10] transition-colors">
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

      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-lg">
              📝
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">NextGenNotes</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="text-sm bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400 w-40"
              />
            </div>
            <button
              onClick={() => setAiCanvasOpen((prev) => !prev)}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <Sparkles size={14} />
              AI as Partner
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg px-3 py-1.5 hover:bg-purple-700"
            >
              <Plus size={14} />
              New Note
            </button>
            <ProfileMenu />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-6">
          {/* Heading row */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeCollection ? activeCollection.name : VIEW_LABELS[activeView]}
              <span className="ml-2 text-base font-normal text-gray-400 dark:text-gray-500">
                — {greeting}, {user?.name}
              </span>
            </h1>
            <div className="flex items-center gap-2">
              {/* <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5">
                <Calendar size={13} />
                Date
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5">
                <Grid3x3 size={13} />
                Grid
              </button> */}
            </div>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} · {pinnedNotes.length} pinned
          </p>

          {activeView === "trash" && counts.trash > 0 && (
            <button
              onClick={() => setEmptyTrashOpen(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 mb-6"
            >
              <Trash2 size={14} />
              Permanently delete all
            </button>
          )}

          {activeCollection && (
            <button
              onClick={() => { fetchAllNotesForPicker(); setAddNotesModalOpen(true); }}
              className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 rounded-lg px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 mb-6"
            >
              <FolderPlus size={14} />
              Add existing note
            </button>
          )}

          {loading ? (
            <p className="text-gray-400 dark:text-gray-500">Loading notes...</p>
          ) : filteredNotes.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
              {searchQuery
                ? `No notes match "${searchQuery}"`
                : `Nothing in ${activeCollection ? activeCollection.name : VIEW_LABELS[activeView]} yet`}
            </p>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-8">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-purple-500 dark:text-purple-400 uppercase mb-3">
                    <Pin size={12} />
                    Pinned
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map(renderCard)}
                  </div>
                </div>
              )}

              {otherNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <p className="text-xs font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase mb-3">
                      Other Notes
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherNotes.map(renderCard)}
                  </div>
                </div>
              )}
            </>
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

      <AddNotesToCollectionModal
        isOpen={addNotesModalOpen}
        onClose={() => setAddNotesModalOpen(false)}
        availableNotes={allNotesForPicker}
        onConfirm={handleAddNotesToCollection}
        collectionName={activeCollection?.name}
      />
    </div>
  );
};

export default Dashboard;