import { useState } from 'react';
import { X, Sparkles, Send, Save } from 'lucide-react';
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
    <aside className="w-80 h-screen bg-white border-l border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-600" />
          <h2 className="font-semibold text-gray-900">AI Canvas</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">How are you feeling?</p>
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  mood === m
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {generatedContent && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p className="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
              <Sparkles size={12} />
              Generated note
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{generatedContent}</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving...' : 'Save as note'}
            </button>
          </div>
        )}

        {loading && (
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles size={14} className="animate-pulse" />
            Writing your note...
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write, plan, share what's on your mind..."
            rows={2}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-300 resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AICanvas;