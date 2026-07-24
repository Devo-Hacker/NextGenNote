import { useState } from 'react';
import { X, Sparkles, Send, Save, MessageCircle } from 'lucide-react';
import { generateAINote } from '../api/ai';
import { createNote } from '../api/notes';

const MOODS = ['😊 Happy', '😔 Sad', '😰 Anxious', '😤 Frustrated', '😌 Calm', '🤔 Reflective'];

const AICanvas = ({ isOpen, onClose, onNoteSaved }) => {
  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedContent('');
    try {
      const res = await generateAINote(prompt, mood);
      setGeneratedContent(res.data.content);
    } catch (err) {
      console.error('AI generation failed', err);
      setGeneratedContent('Something went wrong generating your note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await createNote({
        title: prompt.slice(0, 40) || 'AI Note',
        content: generatedContent,
        isAIGenerated: true,
        mood,
      });
      onNoteSaved(res.data);
      setPrompt('');
      setMood('');
      setGeneratedContent('');
    } catch (err) {
      console.error('Failed to save AI note', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile/tablet backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <aside
        className="
          relative flex flex-col overflow-hidden border-l border-white/40 bg-[#e0f0ff]
          fixed inset-0 z-50 w-full h-full
          lg:static lg:inset-auto lg:z-auto lg:w-80 lg:h-screen
        "
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .ai-canvas-root, .ai-canvas-root * { font-family: 'Plus Jakarta Sans', sans-serif; }
          .ai-canvas-glass {
            backdrop-filter: blur(12px);
            background: rgba(255, 255, 255, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          }
          .ai-canvas-input {
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(8px);
          }
          .ai-canvas-btn {
            background: linear-gradient(135deg, #904df1 0%, #762dd7 100%);
            box-shadow: 0 4px 12px rgba(118, 45, 215, 0.3), inset 0 0 8px rgba(255, 255, 255, 0.2);
          }
          .ai-canvas-chip:hover {
            background: rgba(255, 255, 255, 0.65);
            transform: translateY(-2px);
            box-shadow: 0 0 15px rgba(144, 77, 241, 0.2);
          }
          @keyframes ai-canvas-float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(10px, 15px); }
            100% { transform: translate(0, 0); }
          }
          .ai-canvas-blob {
            position: absolute;
            border-radius: 9999px;
            filter: blur(80px);
            z-index: 0;
            animation: ai-canvas-float 20s infinite ease-in-out;
            pointer-events: none;
          }
        `}</style>

        <div className="ai-canvas-root h-full w-full flex flex-col relative">
          {/* Atmospheric background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="ai-canvas-blob w-[320px] h-[320px] bg-[#762dd7]/20 -top-16 -left-16" />
            <div className="ai-canvas-blob w-[260px] h-[260px] bg-[#00ccf9]/25 bottom-10 -right-16" style={{ animationDelay: '-5s' }} />
            <div className="ai-canvas-blob w-[220px] h-[220px] bg-[#ffd9e2]/40 top-1/2 left-1/4" style={{ animationDelay: '-10s' }} />
          </div>

          {/* Header */}
          <header className="relative z-10 ai-canvas-glass flex items-center justify-between px-4 py-3.5 border-b-0 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#762dd7]/10 text-[#762dd7]">
                <Sparkles size={18} />
              </div>
              <span className="font-semibold text-[#191c1e]">AI Canvas</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/40 transition-colors text-[#4b4454]"
            >
              <X size={18} />
            </button>
          </header>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
            {/* Mood selection */}
            <section className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-semibold text-[#4b4454] uppercase tracking-wider">
                How are you feeling?
              </h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const [emoji, ...labelParts] = m.split(' ');
                  const label = labelParts.join(' ');
                  const isActive = mood === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`ai-canvas-chip ai-canvas-glass flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                        isActive ? '!bg-[#762dd7]/20 !border-[#762dd7]/40 scale-[1.02]' : ''
                      }`}
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="text-xs font-medium text-[#191c1e]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Content area */}
            {generatedContent ? (
              <section className="ai-canvas-glass rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-[#762dd7] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Generated note
                </p>
                <p className="text-sm text-[#191c1e] whitespace-pre-line leading-relaxed">
                  {generatedContent}
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="self-start flex items-center gap-1.5 text-xs font-semibold text-[#762dd7] bg-white/70 border border-[#762dd7]/20 px-3 py-1.5 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                >
                  <Save size={13} />
                  {saving ? 'Saving...' : 'Save as note'}
                </button>
              </section>
            ) : (
              <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10 border border-white/40 border-dashed rounded-2xl bg-white/10">
                <div className="p-4 rounded-full bg-[#762dd7]/5 mb-3">
                  <MessageCircle size={40} className="text-[#762dd7]/40" />
                </div>
                <p className="text-sm text-[#4b4454] max-w-[220px]">
                  Start a conversation to see your thoughts reflected here.
                </p>
              </section>
            )}

            {loading && (
              <div className="text-sm text-[#4b4454] flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse text-[#762dd7]" />
                Writing your note...
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="relative z-10 p-4 bg-white/10 border-t border-white/20 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2 ai-canvas-input rounded-2xl p-1.5 pl-3.5 focus-within:border-[#762dd7]/50 transition-all">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="share your emotions..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm text-[#191c1e] placeholder:text-[#4b4454]/50 resize-none py-2"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="ai-canvas-btn w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95 disabled:opacity-90"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AICanvas;