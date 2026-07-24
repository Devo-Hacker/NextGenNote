import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Link2, X, Pencil, FolderInput } from 'lucide-react';
import { getNoteById, updateNote, createNote, archiveNote, getNotes, toggleNoteLink } from '../api/notes';
import { setNoteCollection } from '../api/collections';
import { getCollections } from '../api/collections';

const NoteEditor = () => {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const presetCollectionId = searchParams.get('collectionId') || null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [linkedNotes, setLinkedNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState(presetCollectionId);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);

  const backTarget = location.state?.from === 'connections' ? '/connections' : '/dashboard';

  useEffect(() => {
    if (!isNew) {
      const fetchNote = async () => {
        try {
          const res = await getNoteById(id);
          setTitle(res.data.title);
          setContent(res.data.content);
          setIsAIGenerated(res.data.isAIGenerated);
          setLinkedNotes(res.data.linkedNotes || []);
          setCollectionId(res.data.collectionId || null);
        } catch (err) {
          console.error('Failed to load note', err);
        } finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
    const fetchAllNotes = async () => {
      try {
        const res = await getNotes({ filter: 'all' });
        setAllNotes(res.data);
      } catch (err) {
        console.error('Failed to load notes list', err);
      }
    };
    const fetchCollections = async () => {
      try {
        const res = await getCollections();
        setCollections(res.data);
      } catch (err) {
        console.error('Failed to load collections', err);
      }
    };
    fetchAllNotes();
    fetchCollections();
  }, [id, isNew]);

  const hasContent = title.trim() || content.trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        if (!hasContent) {
          navigate(backTarget);
          return;
        }
        const res = await createNote({
          title: title.trim() || 'Untitled',
          content,
          collectionId: presetCollectionId,
        });
        setSaved(true);
        setMode('view');
        navigate(`/notes/${res.data._id}`, { replace: true, state: location.state });
      } else {
        await updateNote(id, { title, content });
        setSaved(true);
        setMode('view');
        setTimeout(() => setSaved(false), 1500);
      }
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToArchive = async () => {
    setSaving(true);
    try {
      if (isNew) {
        if (!hasContent) {
          navigate(backTarget);
          return;
        }
        const res = await createNote({ title: title.trim() || 'Untitled', content });
        await archiveNote(res.data._id);
      } else {
        await updateNote(id, { title, content });
        await archiveNote(id);
      }
      navigate(backTarget);
    } catch (err) {
      console.error('Failed to archive note', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isNew && !hasContent) {
      navigate(backTarget);
      return;
    }
    if (isNew && hasContent) {
      handleSave();
      return;
    }
    navigate(backTarget);
  };

  const handleToggleLink = async (targetId) => {
    try {
      await toggleNoteLink(id, targetId);
      setLinkedNotes((prev) =>
        prev.includes(targetId) ? prev.filter((l) => l !== targetId) : [...prev, targetId]
      );
    } catch (err) {
      console.error('Failed to toggle link', err);
    }
  };

  const handlePickCollection = async (newCollectionId) => {
    try {
      await setNoteCollection(id, newCollectionId);
      setCollectionId(newCollectionId);
      setCollectionPickerOpen(false);
    } catch (err) {
      console.error('Failed to set collection', err);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const activeCollectionName = collections.find((c) => c._id === collectionId)?.name;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a10]">
        <p className="text-gray-500 text-sm">Loading note...</p>
      </div>
    );
  }

  const isEditing = mode === 'edit';

  return (
    <div className="min-h-screen bg-[#0a0a10] relative overflow-hidden flex items-center justify-center px-4 py-8">
      <style>{`
        .neon-glow-bg { position: absolute; border-radius: 9999px; filter: blur(90px); pointer-events: none; }
        .neon-panel { background: rgba(20, 20, 28, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); box-shadow: 0 0 40px rgba(168, 85, 247, 0.08), 0 8px 32px rgba(0,0,0,0.4); }
        .neon-underline { background: linear-gradient(90deg, #c084fc 0%, #f472b6 100%); }
        .neon-save-btn { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); box-shadow: 0 4px 14px rgba(216, 70, 200, 0.35); }
      `}</style>

      <div className="neon-glow-bg w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] bg-purple-500/20 -top-20 -left-20" />
      <div className="neon-glow-bg w-[200px] h-[200px] sm:w-[380px] sm:h-[380px] bg-fuchsia-500/15 bottom-0 right-0" />
      <div className="neon-glow-bg w-[160px] h-[160px] sm:w-[300px] sm:h-[300px] bg-indigo-500/10 top-1/3 left-1/2" />

      <div className="relative w-full max-w-3xl">
        <div className="neon-panel rounded-2xl overflow-hidden">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
            {/* Topbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {isAIGenerated && (
                  <span className="flex items-center gap-1 text-xs text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 rounded-full">
                    <Sparkles size={12} />
                    AI Generated
                  </span>
                )}
                {activeCollectionName && !isEditing && (
                  <span className="text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {activeCollectionName}
                  </span>
                )}

                {!isEditing && (
                  <button
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-200 border border-white/10 bg-white/5 rounded-lg px-3 sm:px-4 py-2 hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}

                {isEditing && (
                  <>
                    <button
                      onClick={handleSaveToArchive}
                      disabled={saving}
                      className="text-xs sm:text-sm font-medium text-gray-300 border border-white/10 bg-white/5 rounded-lg px-3 sm:px-4 py-2 hover:bg-white/10 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Save to </span>Archive
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="neon-save-btn flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white rounded-lg px-3 sm:px-4 py-2 transition-opacity disabled:opacity-50 whitespace-nowrap"
                    >
                      {saved ? <Check size={14} /> : null}
                      {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editor / Viewer */}
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                autoFocus={isNew}
                className="w-full text-2xl sm:text-3xl font-semibold text-white/90 outline-none mb-1 bg-transparent placeholder-white/30"
              />
            ) : (
              <h1 className="w-full text-2xl sm:text-3xl font-semibold text-white/90 mb-1">{title || 'Untitled'}</h1>
            )}
            <div className="neon-underline h-0.5 w-12 rounded-full mb-6" />

            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                rows={16}
                className="w-full text-base text-gray-300 outline-none bg-transparent placeholder-white/30 resize-none leading-relaxed"
              />
            ) : (
              <p className="w-full text-base text-gray-300 leading-relaxed whitespace-pre-line min-h-[200px]">
                {content || 'This note is empty. Click Edit to start writing.'}
              </p>
            )}

            {/* Editing-only tools: link + collection */}
            {isEditing && !isNew && (
              <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                <div>
                  <button
                    onClick={() => setCollectionPickerOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 text-sm text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <FolderInput size={14} />
                    {activeCollectionName ? `In "${activeCollectionName}"` : 'Add to a collection'}
                  </button>
                  {collectionPickerOpen && (
                    <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-2 max-w-xs space-y-1">
                      {collectionId && (
                        <button
                          onClick={() => handlePickCollection(null)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5"
                        >
                          Remove from collection
                        </button>
                      )}
                      {collections.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => handlePickCollection(c._id)}
                          className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm ${
                            collectionId === c._id ? 'bg-purple-500/15 text-purple-200' : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </button>
                      ))}
                      {collections.length === 0 && (
                        <p className="text-xs text-gray-500 px-3 py-2">No collections yet</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => setLinkPanelOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 text-sm text-fuchsia-300 hover:text-fuchsia-200 transition-colors"
                  >
                    <Link2 size={14} />
                    {linkedNotes.length > 0 ? `Linked to ${linkedNotes.length} note(s)` : 'Link this note to others'}
                  </button>

                  {linkPanelOpen && (
                    <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={linkSearch}
                          onChange={(e) => setLinkSearch(e.target.value)}
                          placeholder="Search notes to link..."
                          className="flex-1 text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2 outline-none focus:border-fuchsia-400/50 transition-colors"
                        />
                        <button onClick={() => setLinkPanelOpen(false)} className="text-gray-400 hover:text-white shrink-0">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {allNotes
                          .filter((n) => n._id !== id && n.title.toLowerCase().includes(linkSearch.toLowerCase()))
                          .map((n) => (
                            <button
                              key={n._id}
                              onClick={() => handleToggleLink(n._id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                                linkedNotes.includes(n._id)
                                  ? 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30'
                                  : 'hover:bg-white/5 text-gray-300 border border-transparent'
                              }`}
                            >
                              <span className="truncate">{n.title || 'Untitled'}</span>
                              {linkedNotes.includes(n._id) && <span className="text-xs shrink-0 ml-2">Linked</span>}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-gray-500">
              <span>{isNew ? 'Draft — not saved yet' : saved ? 'Saved just now' : isEditing ? 'Editing' : 'Viewing'}</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;