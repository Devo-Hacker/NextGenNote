import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { getNoteById, updateNote, archiveNote } from '../api/notes';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await getNoteById(id);
        setTitle(res.data.title);
        setContent(res.data.content);
        setIsAIGenerated(res.data.isAIGenerated);
      } catch (err) {
        console.error('Failed to load note', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNote(id, { title, content });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToArchive = async () => {
    setSaving(true);
    try {
      await updateNote(id, { title, content });
      await archiveNote(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to archive note', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    await handleSave();
    navigate('/dashboard');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a10]">
        <p className="text-gray-500 text-sm">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] relative overflow-hidden flex items-center justify-center px-4 py-8">
      <style>{`
        .neon-glow-bg {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          pointer-events: none;
        }
        .neon-panel {
          background: rgba(20, 20, 28, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.08), 0 8px 32px rgba(0,0,0,0.4);
        }
        .neon-underline {
          background: linear-gradient(90deg, #c084fc 0%, #f472b6 100%);
        }
        .neon-save-btn {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          box-shadow: 0 4px 14px rgba(216, 70, 200, 0.35);
        }
      `}</style>

      {/* Ambient glow blobs */}
      <div className="neon-glow-bg w-[420px] h-[420px] bg-purple-500/20 -top-20 -left-20" />
      <div className="neon-glow-bg w-[380px] h-[380px] bg-fuchsia-500/15 bottom-0 right-0" />
      <div className="neon-glow-bg w-[300px] h-[300px] bg-indigo-500/10 top-1/3 left-1/2" />

      <div className="relative w-full max-w-3xl">
        <div className="neon-panel rounded-2xl overflow-hidden">
          <div className="max-w-3xl mx-auto px-8 py-6">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <div className="flex items-center gap-3">
                {isAIGenerated && (
                  <span className="flex items-center gap-1 text-xs text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 rounded-full">
                    <Sparkles size={12} />
                    AI Generated
                  </span>
                )}
                <button
                  onClick={handleSaveToArchive}
                  disabled={saving}
                  className="text-sm font-medium text-gray-300 border border-white/10 bg-white/5 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Save to Archive
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="neon-save-btn flex items-center gap-1.5 text-sm font-medium text-white rounded-lg px-4 py-2 transition-opacity disabled:opacity-50"
                >
                  {saved ? <Check size={14} /> : null}
                  {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Editor */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-3xl font-semibold text-white/90 outline-none mb-1 bg-transparent placeholder-white/30"
            />
            <div className="neon-underline h-0.5 w-12 rounded-full mb-6" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              rows={16}
              className="w-full text-base text-gray-300 outline-none bg-transparent placeholder-white/30 resize-none leading-relaxed"
            />

            {/* Footer status */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-gray-500">
              <span>{saved ? 'Saved just now' : 'Draft'}</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;