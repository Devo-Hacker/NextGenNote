import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Wand2, GitBranch, X, Check, Loader2, Code2,
  Pencil, Terminal, CircleDot, Sun, Moon,
} from 'lucide-react';
import {
  getSnippets, getSnippetById, createSnippet, updateSnippet, deleteSnippet,
  detectLanguage, translateCode, generateDiagram, getSupportedLanguages,
} from '../api/devmode';
import ConfirmDialog from '../components/ConfirmDialog';
import MermaidDiagram from '../components/MermaidDiagram';

const LANGUAGE_LABELS = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', java: 'Java',
  c: 'C', cpp: 'C++', csharp: 'C#', go: 'Go', rust: 'Rust', php: 'PHP',
  ruby: 'Ruby', swift: 'Swift', kotlin: 'Kotlin', sql: 'SQL', html: 'HTML',
  css: 'CSS', plaintext: 'Plain text',
};

const LANGUAGE_META = {
  javascript: { dot: 'bg-yellow-400', ext: 'js' },
  typescript: { dot: 'bg-blue-400', ext: 'ts' },
  python: { dot: 'bg-green-400', ext: 'py' },
  java: { dot: 'bg-orange-400', ext: 'java' },
  c: { dot: 'bg-sky-400', ext: 'c' },
  cpp: { dot: 'bg-pink-400', ext: 'cpp' },
  csharp: { dot: 'bg-purple-400', ext: 'cs' },
  go: { dot: 'bg-cyan-400', ext: 'go' },
  rust: { dot: 'bg-orange-500', ext: 'rs' },
  php: { dot: 'bg-indigo-400', ext: 'php' },
  ruby: { dot: 'bg-red-400', ext: 'rb' },
  swift: { dot: 'bg-orange-400', ext: 'swift' },
  kotlin: { dot: 'bg-violet-400', ext: 'kt' },
  sql: { dot: 'bg-teal-400', ext: 'sql' },
  html: { dot: 'bg-orange-400', ext: 'html' },
  css: { dot: 'bg-blue-400', ext: 'css' },
  plaintext: { dot: 'bg-gray-500', ext: 'txt' },
};

const dotClass = (lang) => LANGUAGE_META[lang]?.dot || 'bg-gray-500';

const THEME_STORAGE_KEY = 'devmode-theme';

const DevMode = () => {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState(null);
  const [languages, setLanguages] = useState([]);

  const [translatePanelOpen, setTranslatePanelOpen] = useState(false);
  const [translateTarget, setTranslateTarget] = useState('python');
  const [translating, setTranslating] = useState(false);
  const [translatedCode, setTranslatedCode] = useState('');

  const [diagramOpen, setDiagramOpen] = useState(false);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [diagramChart, setDiagramChart] = useState('');

  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const renameInputRef = useRef(null);

  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Glassmorphism Token Map
  const T = {
    // The absolute background has a subtle gradient so the glass panels have something to blur
    appBg: isDark 
      ? 'bg-gradient-to-br from-[#0f111a] via-[#1a1c29] to-[#0f111a]' 
      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
    
    // Frosted panels (sidebar, topbar, modals)
    panelBg: isDark 
      ? 'bg-[#161b22]/60 backdrop-blur-xl shadow-lg' 
      : 'bg-white/60 backdrop-blur-xl shadow-lg',
    
    // Editor background (slightly deeper to contrast with panels)
    editorBg: isDark 
      ? 'bg-black/20 backdrop-blur-md' 
      : 'bg-white/40 backdrop-blur-md',
    
    // Line numbers 
    lineNumBg: isDark ? 'bg-black/20' : 'bg-white/30',
    
    // Borders adjusted to be semi-transparent for the glassy edge effect
    border: isDark ? 'border-white/10' : 'border-gray-300/40',
    borderFaint: isDark ? 'border-white/5' : 'border-gray-200/40',
    
    text: isDark ? 'text-gray-200' : 'text-gray-800',
    textStrong: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textFaint: isDark ? 'text-gray-500' : 'text-gray-400',
    
    // Hover states for glassy buttons
    hoverBg: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-900/5',
    hoverText: isDark ? 'hover:text-white' : 'hover:text-gray-900',
    activeRow: isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-purple-500/10 text-purple-900 shadow-sm',
    
    minimapBorder: isDark ? 'border-white/5' : 'border-gray-200/50',
    minimapTone1: isDark ? 'bg-purple-500/40' : 'bg-purple-400/50',
    minimapTone2: isDark ? 'bg-cyan-500/30' : 'bg-cyan-400/50',
    minimapTone3: isDark ? 'bg-gray-600/30' : 'bg-gray-400/50',
  };

  const detectTimeout = useRef(null);
  const codeRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const lines = code.split('\n');
  const lineCount = lines.length;

  const fetchSnippets = useCallback(async () => {
    try {
      const res = await getSnippets();
      setSnippets(res.data);
    } catch (err) {
      console.error('Failed to fetch snippets', err);
    }
  }, []);

  useEffect(() => {
    getSupportedLanguages().then((res) => setLanguages(res.data)).catch(() => {});
    fetchSnippets().finally(() => setLoading(false));
  }, [fetchSnippets]);

  const openSnippet = async (snippet) => {
    setActiveId(snippet._id);
    setTitle(snippet.title);
    setCode(snippet.code);
    setLanguage(snippet.language);
    setDiagramChart('');
    setTranslatePanelOpen(false);
    setRenaming(false);
    setCursor({ line: 1, col: 1 });
  };

  const handleNew = async () => {
    try {
      const res = await createSnippet({ title: 'Untitled Snippet', code: '', language: 'plaintext' });
      setSnippets((prev) => [res.data, ...prev]);
      openSnippet(res.data);
    } catch (err) {
      console.error('Failed to create snippet', err);
    }
  };

  const handleSave = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      const res = await updateSnippet(activeId, { title, code, language });
      setSnippets((prev) => prev.map((s) => (s._id === activeId ? res.data : s)));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save snippet', err);
    } finally {
      setSaving(false);
    }
  };

  const startRenaming = () => {
    setRenameDraft(title || 'Untitled Snippet');
    setRenaming(true);
    setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 0);
  };

  const commitRename = async () => {
    const next = renameDraft.trim() || 'Untitled Snippet';
    setRenaming(false);
    if (next === title) return;
    setTitle(next);
    if (!activeId) return;
    try {
      setSaving(true);
      const res = await updateSnippet(activeId, { title: next, code, language });
      setSnippets((prev) => prev.map((s) => (s._id === activeId ? res.data : s)));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to rename snippet', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setRenaming(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (detectTimeout.current) clearTimeout(detectTimeout.current);
    if (!value.trim()) return;
    detectTimeout.current = setTimeout(async () => {
      setDetecting(true);
      try {
        const res = await detectLanguage(value);
        setLanguage(res.data.language);
      } catch (err) {
        console.error('Language detection failed', err);
      } finally {
        setDetecting(false);
      }
    }, 1000);
  };

  const updateCursor = () => {
    const el = codeRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const upToCursor = el.value.slice(0, pos);
    const linesUpToCursor = upToCursor.split('\n');
    setCursor({
      line: linesUpToCursor.length,
      col: linesUpToCursor[linesUpToCursor.length - 1].length + 1,
    });
  };

  const syncScroll = () => {
    if (lineNumbersRef.current && codeRef.current) {
      lineNumbersRef.current.scrollTop = codeRef.current.scrollTop;
    }
  };

  const confirmDeleteSnippet = async () => {
    if (!snippetToDelete) return;
    try {
      await deleteSnippet(snippetToDelete._id);
      setSnippets((prev) => prev.filter((s) => s._id !== snippetToDelete._id));
      if (activeId === snippetToDelete._id) {
        setActiveId(null);
        setTitle('');
        setCode('');
        setLanguage('plaintext');
      }
    } catch (err) {
      console.error('Failed to delete snippet', err);
    } finally {
      setSnippetToDelete(null);
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslatedCode('');
    try {
      const res = await translateCode(code, language, translateTarget);
      setTranslatedCode(res.data.code);
    } catch (err) {
      console.error('Translation failed', err);
      setTranslatedCode('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const applyTranslation = () => {
    setCode(translatedCode);
    setLanguage(translateTarget);
    setTranslatePanelOpen(false);
    setTranslatedCode('');
  };

  const handleGenerateDiagram = async () => {
    setDiagramOpen(true);
    setDiagramLoading(true);
    try {
      const res = await generateDiagram(code, language);
      setDiagramChart(res.data.diagram);
    } catch (err) {
      console.error('Diagram generation failed', err);
    } finally {
      setDiagramLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${T.appBg}`}>
        <p className={`text-sm ${T.textMuted}`}>Loading Developer Mode...</p>
      </div>
    );
  }

  const fileLabel = title || 'Untitled Snippet';
  const filePath = activeId ? `~/snippets/${fileLabel}` : '~/snippets';

  return (
    <div className={`h-screen flex flex-col ${T.appBg} ${T.text} font-mono transition-colors duration-300`}>
      {/* Topbar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${T.border} shrink-0 ${T.panelBg} z-10`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-1.5 text-xs ${T.textMuted} ${T.hoverText} transition-colors font-sans`}
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
          <div className={`w-px h-4 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-1.5 text-sm font-sans font-semibold ${T.textStrong}`}>
            <Code2 size={15} className="text-purple-500" />
            Developer Mode
          </div>
        </div>

        <div className={`hidden md:flex items-center gap-1.5 text-[11px] ${T.textFaint} font-sans`}>
          <span className="text-[9px]">●</span>
          {filePath}
        </div>

        <div className="flex items-center gap-2 font-sans">
          
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to white mode' : 'Switch to dark mode'}
            className={`flex items-center gap-1.5 text-[11px] ${T.textMuted} ${T.hoverText} border ${T.border} rounded-md px-2 py-1 ${T.hoverBg} transition-colors`}
          >
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File sidebar */}
        <div className={`w-56 shrink-0 border-r ${T.border} ${T.panelBg} overflow-y-auto flex flex-col z-10`}>
          <div className={`flex items-center justify-between px-3 py-2.5 border-b ${T.borderFaint} font-sans`}>
            <span className={`text-[10px] tracking-wider ${T.textMuted}`}>SNIPPETS</span>
            <button
              onClick={handleNew}
              className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-400 transition-colors"
            >
              <Plus size={13} />
              New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {snippets.map((s) => (
              <div
                key={s._id}
                onClick={() => openSnippet(s)}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer text-xs font-sans border-b ${T.borderFaint} transition-colors ${
                  activeId === s._id ? T.activeRow : `${T.textMuted} ${T.hoverBg}`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(s.language)} shadow-sm`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{s.title || 'Untitled Snippet'}</p>
                  <span className={`text-[10px] ${activeId === s._id ? 'text-purple-300' : 'text-purple-500'}`}>
                    {LANGUAGE_LABELS[s.language] || s.language}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSnippetToDelete(s); }}
                  className={`opacity-0 group-hover:opacity-100 ${T.textFaint} hover:text-red-400 shrink-0 transition-opacity`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {snippets.length === 0 && (
              <p className={`text-xs ${T.textFaint} font-sans px-3 py-6 text-center`}>No snippets yet</p>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeId ? (
            <>
              {/* Tab bar */}
              <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b ${T.border} ${T.panelBg} shrink-0`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex items-center gap-2 ${T.editorBg} border ${T.border} rounded-t-lg px-3 py-1.5 -mb-[9px] pb-[9px]`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass(language)} shadow-sm`} />
                    {renaming ? (
                      <input
                        ref={renameInputRef}
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleRenameKeyDown}
                        className={`bg-transparent text-sm font-sans ${T.textStrong} outline-none border-b border-purple-500/50 focus:border-purple-500 px-0.5 w-40`}
                      />
                    ) : (
                      <button
                        onClick={startRenaming}
                        className={`flex items-center gap-1.5 text-sm font-sans ${T.textStrong} group`}
                        title="Rename file"
                      >
                        <span className="truncate max-w-[12rem]">{fileLabel}</span>
                        <Pencil size={11} className={`${T.textFaint} opacity-0 group-hover:opacity-100 shrink-0 transition-opacity`} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-sans">
                  <span className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {detecting ? <Loader2 size={11} className="animate-spin" /> : null}
                    {LANGUAGE_LABELS[language] || language}
                  </span>
                  <button
                    onClick={() => setTranslatePanelOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 text-xs ${T.textMuted} border ${T.border} rounded-lg px-3 py-1.5 ${T.hoverBg} transition-colors`}
                  >
                    <Wand2 size={12} />
                    Convert
                  </button>
                  <button
                    onClick={handleGenerateDiagram}
                    className={`flex items-center gap-1.5 text-xs ${T.textMuted} border ${T.border} rounded-lg px-3 py-1.5 ${T.hoverBg} transition-colors`}
                  >
                    <GitBranch size={12} />
                    Diagram
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-purple-600/90 hover:bg-purple-600 border border-purple-500/50 shadow-lg shadow-purple-500/20 backdrop-blur-md rounded-lg px-3 py-1.5 disabled:opacity-50 transition-all"
                  >
                    {saved ? <Check size={12} /> : <Save size={12} />}
                    {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Translate panel */}
              {translatePanelOpen && (
                <div className={`border-b ${T.border} ${T.panelBg} p-4 font-sans absolute top-[53px] left-0 right-0 z-20 shadow-xl`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs ${T.textMuted}`}>Convert to:</span>
                    <select
                      value={translateTarget}
                      onChange={(e) => setTranslateTarget(e.target.value)}
                      className={`bg-transparent border ${T.border} text-sm ${T.textStrong} rounded-lg px-2 py-1.5 outline-none focus:border-purple-500/50 [&>option]:bg-gray-900 [&>option]:text-white`}
                    >
                      {languages.filter((l) => l !== 'plaintext').map((l) => (
                        <option key={l} value={l}>{LANGUAGE_LABELS[l] || l}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleTranslate}
                      disabled={translating}
                      className="text-xs font-medium text-white bg-purple-600/90 border border-purple-500/50 backdrop-blur-md rounded-lg px-3 py-1.5 hover:bg-purple-600 disabled:opacity-50 transition-all"
                    >
                      {translating ? 'Converting...' : 'Convert'}
                    </button>
                    <button onClick={() => setTranslatePanelOpen(false)} className={`${T.textMuted} ${T.hoverText} ml-auto transition-colors`}>
                      <X size={16} />
                    </button>
                  </div>

                  {translatedCode && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-[11px] ${T.textMuted} mb-1.5`}>Original ({LANGUAGE_LABELS[language]})</p>
                          <pre className={`${T.editorBg} border ${T.border} rounded-lg p-3 text-xs overflow-auto max-h-60 whitespace-pre-wrap shadow-inner`}>{code}</pre>
                        </div>
                        <div>
                          <p className={`text-[11px] ${T.textMuted} mb-1.5`}>Converted ({LANGUAGE_LABELS[translateTarget]})</p>
                          <pre className={`${T.editorBg} border border-purple-500/30 rounded-lg p-3 text-xs overflow-auto max-h-60 whitespace-pre-wrap shadow-inner`}>{translatedCode}</pre>
                        </div>
                      </div>
                      <button
                        onClick={applyTranslation}
                        className="mt-4 text-xs font-medium text-white bg-purple-600/90 border border-purple-500/50 backdrop-blur-md rounded-lg px-4 py-2 hover:bg-purple-600 shadow-lg shadow-purple-500/20 transition-all"
                      >
                        Use converted version
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Code editor */}
              <div className="flex-1 flex overflow-hidden min-h-0 relative z-0">
                <div
                  ref={lineNumbersRef}
                  className={`select-none text-right pr-3 pl-4 pt-4 text-xs ${T.textFaint} ${T.lineNumBg} overflow-hidden backdrop-blur-sm`}
                >
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={`leading-6 ${i + 1 === cursor.line ? 'text-purple-400 font-medium' : ''}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onScroll={syncScroll}
                  onClick={updateCursor}
                  onKeyUp={updateCursor}
                  onSelect={updateCursor}
                  spellCheck={false}
                  placeholder="// Start writing code — language is detected automatically"
                  className={`flex-1 ${T.editorBg} ${T.text} text-sm leading-6 outline-none resize-none p-4 pl-1 bg-transparent`}
                />
                {/* Decorative minimap */}
                <div className={`hidden lg:flex flex-col w-16 shrink-0 border-l ${T.minimapBorder} ${T.editorBg} px-2 pt-4 gap-[3px] overflow-hidden`}>
                  {lines.slice(0, 40).map((ln, i) => {
                    const w = Math.min(100, Math.max(8, ln.trim().length * 3));
                    const tone = ln.trim().length === 0
                      ? 'bg-transparent'
                      : i % 5 === 0
                        ? T.minimapTone1
                        : i % 3 === 0
                          ? T.minimapTone2
                          : T.minimapTone3;
                    return (
                      <div key={i} className={`h-[3px] rounded-full ${tone} transition-all`} style={{ width: `${w}%` }} />
                    );
                  })}
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-1.5 text-[11px] font-sans text-purple-100 bg-purple-600/90 backdrop-blur-md border-t border-purple-500/50 shrink-0 z-10 shadow-[0_-4px_15px_-3px_rgba(147,51,234,0.15)]">
                <div className="flex items-center gap-4">
                  <span className="opacity-90">Ln {cursor.line}, Col {cursor.col}</span>
                  <span className="opacity-90">{LANGUAGE_LABELS[language] || language}</span>
                  <span className="opacity-90">UTF-8</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="opacity-90">{lineCount} lines</span>
                  
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center font-sans">
              <div className={`px-6 py-4 rounded-2xl ${T.panelBg} border ${T.border}`}>
                <p className={`text-sm ${T.textMuted} flex items-center gap-2`}>
                  <Code2 size={16} className="text-purple-500" />
                  Select a snippet or create a new one to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diagram modal */}
      {diagramOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 font-sans animate-in fade-in duration-200">
          <div className={`${T.panelBg} border ${T.border} shadow-2xl rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${T.textStrong} font-semibold flex items-center gap-2 text-lg`}>
                <GitBranch size={18} className="text-purple-500" />
                Logic Diagram
              </h3>
              <button onClick={() => setDiagramOpen(false)} className={`p-1.5 rounded-lg ${T.hoverBg} ${T.textMuted} ${T.hoverText} transition-colors`}>
                <X size={18} />
              </button>
            </div>
            {diagramLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={24} className="animate-spin text-purple-500" />
                <p className={`text-sm ${T.textMuted}`}>Analyzing code and generating diagram...</p>
              </div>
            ) : diagramChart ? (
              <div className={`p-4 rounded-xl ${T.editorBg} border ${T.border}`}>
                <MermaidDiagram chart={diagramChart} />
              </div>
            ) : (
              <p className={`text-sm ${T.textMuted} text-center py-8`}>Could not generate a diagram.</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!snippetToDelete}
        title="Delete snippet?"
        message={`"${snippetToDelete?.title || 'Untitled Snippet'}" will be permanently deleted.`}
        onConfirm={confirmDeleteSnippet}
        onCancel={() => setSnippetToDelete(null)}
      />
    </div>
  );
};

export default DevMode;