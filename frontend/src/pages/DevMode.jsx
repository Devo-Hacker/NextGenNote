import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Wand2, GitBranch, X, Check, Loader2, Code2,
  Pencil, Terminal, Sun, Moon, Menu,
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

  // Mobile/tablet sidebar drawer state — sidebar is hidden by default below lg
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const T = {
    appBg: isDark
      ? 'bg-gradient-to-br from-[#0f111a] via-[#1a1c29] to-[#0f111a]'
      : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',

    panelBg: isDark
      ? 'bg-[#161b22]/60 backdrop-blur-xl shadow-lg'
      : 'bg-white/60 backdrop-blur-xl shadow-lg',

    sidebarBg: isDark
      ? 'bg-gradient-to-b from-[#1a1b26]/70 via-[#16161e]/80 to-[#1a1b26]/70 backdrop-blur-2xl shadow-[4px_0_24px_-10px_rgba(0,0,0,0.4)]'
      : 'bg-gradient-to-b from-white/80 via-white/60 to-purple-50/80 backdrop-blur-2xl shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)]',

    editorBg: isDark
      ? 'bg-black/20 backdrop-blur-md'
      : 'bg-white/40 backdrop-blur-md',

    lineNumBg: isDark ? 'bg-black/20' : 'bg-white/30',

    border: isDark ? 'border-white/10' : 'border-gray-300/40',
    borderFaint: isDark ? 'border-white/5' : 'border-gray-200/40',

    text: isDark ? 'text-gray-200' : 'text-gray-800',
    textStrong: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textFaint: isDark ? 'text-gray-500' : 'text-gray-400',

    hoverBg: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-900/5',
    hoverText: isDark ? 'hover:text-white' : 'hover:text-gray-900',

    activeRow: isDark
      ? 'bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 border border-purple-500/40 text-purple-50 shadow-[0_4px_15px_-3px_rgba(168,85,247,0.2)]'
      : 'bg-gradient-to-br from-purple-500/15 to-fuchsia-500/5 border border-purple-400/50 text-purple-900 shadow-[0_4px_15px_-3px_rgba(168,85,247,0.15)]',

    minimapBorder: isDark ? 'border-white/5' : 'border-gray-200/50',
    minimapTone1: isDark ? 'bg-purple-500/40' : 'bg-purple-400/50',
    minimapTone2: isDark ? 'bg-cyan-500/30' : 'bg-cyan-400/50',
    minimapTone3: isDark ? 'bg-gray-600/30' : 'bg-gray-400/50',

    statusBarBg: isDark
      ? 'bg-gradient-to-r from-[#7a73e6]/20 via-[#08080c] to-[#7a73e6]/20 border-t border-[#7a73e6]/40 text-purple-100'
      : 'bg-gradient-to-r from-purple-500/80 via-black to-purple-500/80 border-t border-purple-300/60 text-gray-800 shadow-[0_-4px_20px_-5px_rgba(147,51,234,0.1)]',
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
    setSidebarOpen(false); // close mobile drawer after picking a snippet
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
      <div className={`min-h-screen flex items-center justify-center ${T.appBg} font-sans`}>
        <p className={`text-sm ${T.textMuted}`}>Loading Developer Mode...</p>
      </div>
    );
  }

  const fileLabel = title || 'Untitled Snippet';
  const filePath = activeId ? `~/snippets/${fileLabel}` : '~/snippets';

  const SidebarContent = (
    <>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${T.borderFaint}`}>
        <span className={`text-[11px] font-semibold tracking-wider ${T.textMuted}`}>SNIPPETS</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNew}
            className="flex items-center gap-1 text-xs font-medium text-purple-500 hover:text-purple-400 transition-colors"
          >
            <Plus size={14} />
            New
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-1 rounded-md ${T.textMuted} ${T.hoverBg}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        {snippets.map((s) => (
          <div
            key={s._id}
            onClick={() => openSnippet(s)}
            className={`group flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 cursor-pointer text-sm transition-all duration-200 rounded-xl border ${
              activeId === s._id
                ? T.activeRow
                : `border-transparent ${T.textMuted} ${T.hoverBg}`
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass(s.language)} shadow-sm`} />
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium ${activeId === s._id ? 'text-current' : ''}`}>
                {s.title || 'Untitled Snippet'}
              </p>
              <span className={`text-[11px] font-medium tracking-wide ${activeId === s._id ? 'text-purple-300' : 'text-purple-500/70'}`}>
                {LANGUAGE_LABELS[s.language] || s.language}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSnippetToDelete(s); }}
              className={`opacity-0 group-hover:opacity-100 ${T.textFaint} hover:text-red-400 shrink-0 transition-opacity p-1 rounded-md hover:bg-white/10`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {snippets.length === 0 && (
          <p className={`text-sm ${T.textFaint} px-4 py-8 text-center`}>No snippets yet.</p>
        )}
      </div>
    </>
  );

  return (
    <div className={`h-screen flex flex-col ${T.appBg} ${T.text} font-sans transition-colors duration-300`}>
      {/* Topbar */}
      <div className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b ${T.border} shrink-0 ${T.panelBg} z-10`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={`lg:hidden p-1.5 rounded-md ${T.textMuted} ${T.hoverBg} ${T.hoverText} transition-colors shrink-0`}
          >
            <Menu size={18} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-1.5 text-xs font-medium tracking-wide ${T.textMuted} ${T.hoverText} transition-colors shrink-0`}
          >
            <ArrowLeft size={16} />
            <span className="hidden xs:inline">Dashboard</span>
          </button>
          <div className={`hidden sm:block w-px h-4 ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-1.5 text-sm font-semibold tracking-wide ${T.textStrong} truncate`}>
            <Code2 size={16} className="text-purple-500 shrink-0" />
            <span className="hidden sm:inline">Developer Mode</span>
          </div>
        </div>

        <div className={`hidden lg:flex items-center gap-2 text-[12px] font-mono ${T.textFaint} min-w-0`}>
          <span className="text-[10px] text-purple-400 shrink-0">●</span>
          <span className="truncate">{filePath}</span>
        </div>

        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex items-center gap-1.5 text-xs font-medium ${T.textMuted} ${T.hoverText} border ${T.border} rounded-md px-2 py-1 ${T.hoverBg} transition-colors shrink-0`}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile/tablet sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* File sidebar — drawer on mobile/tablet, static on lg+ */}
        <div
          className={`
            ${T.sidebarBg} border-r ${T.border} overflow-y-auto flex flex-col
            fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
            w-72 sm:w-64 lg:w-64 shrink-0
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {SidebarContent}
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          {activeId ? (
            <>
              {/* Tab bar */}
              <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b ${T.border} ${T.panelBg} shrink-0`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex items-center gap-2 ${T.editorBg} border ${T.border} rounded-t-xl px-3 sm:px-4 py-2 -mb-[9px] pb-[10px]`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass(language)} shadow-sm`} />
                    {renaming ? (
                      <input
                        ref={renameInputRef}
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleRenameKeyDown}
                        className={`bg-transparent text-sm font-medium ${T.textStrong} outline-none border-b border-purple-500/50 focus:border-purple-500 px-1 w-32 sm:w-48`}
                      />
                    ) : (
                      <button
                        onClick={startRenaming}
                        className={`flex items-center gap-2 text-sm font-medium ${T.textStrong} group`}
                        title="Rename file"
                      >
                        <span className="truncate max-w-[8rem] sm:max-w-[14rem]">{fileLabel}</span>
                        <Pencil size={12} className={`${T.textFaint} opacity-0 group-hover:opacity-100 shrink-0 transition-opacity`} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-purple-600 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full">
                    {detecting ? <Loader2 size={12} className="animate-spin" /> : null}
                    {LANGUAGE_LABELS[language] || language}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setTranslatePanelOpen((prev) => !prev)}
                      className={`flex items-center gap-1.5 text-xs font-medium ${T.textMuted} border ${T.border} rounded-lg px-2.5 sm:px-3 py-1.5 ${T.hoverBg} transition-colors`}
                    >
                      <Terminal size={14} />
                      <span className="hidden sm:inline">Convert</span>
                    </button>
                    <button
                      onClick={handleGenerateDiagram}
                      className={`flex items-center gap-1.5 text-xs font-medium ${T.textMuted} border ${T.border} rounded-lg px-2.5 sm:px-3 py-1.5 ${T.hoverBg} transition-colors`}
                    >
                      <GitBranch size={14} />
                      <span className="hidden sm:inline">Diagram</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs font-medium text-white bg-purple-600/90 hover:bg-purple-600 border border-purple-500/50 shadow-lg shadow-purple-500/20 backdrop-blur-md rounded-lg px-3 sm:px-4 py-1.5 disabled:opacity-50 transition-all"
                    >
                      {saved ? <Check size={14} /> : <Save size={14} />}
                      <span className="hidden sm:inline">{saving ? 'Saving...' : saved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Translate panel */}
              {translatePanelOpen && (
                <div className={`border-b ${T.border} ${T.panelBg} p-4 sm:p-5 absolute top-[57px] left-0 right-0 z-20 shadow-2xl backdrop-blur-3xl max-h-[calc(100vh-120px)] overflow-y-auto`}>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                    <span className={`text-sm font-medium ${T.textMuted}`}>Convert to:</span>
                    <select
                      value={translateTarget}
                      onChange={(e) => setTranslateTarget(e.target.value)}
                      className={`bg-transparent border ${T.border} text-sm font-medium ${T.textStrong} rounded-lg px-3 py-2 outline-none focus:border-purple-500/50 [&>option]:bg-gray-900 [&>option]:text-white cursor-pointer`}
                    >
                      {languages.filter((l) => l !== 'plaintext').map((l) => (
                        <option key={l} value={l}>{LANGUAGE_LABELS[l] || l}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleTranslate}
                      disabled={translating}
                      className="text-sm font-medium text-white bg-purple-600/90 border border-purple-500/50 backdrop-blur-md rounded-lg px-4 py-2 hover:bg-purple-600 disabled:opacity-50 transition-all shadow-md shadow-purple-500/20"
                    >
                      {translating ? 'Converting...' : 'Convert'}
                    </button>
                    <button onClick={() => setTranslatePanelOpen(false)} className={`p-2 rounded-lg ${T.textMuted} ${T.hoverBg} ${T.hoverText} sm:ml-auto transition-colors`}>
                      <X size={18} />
                    </button>
                  </div>

                  {translatedCode && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${T.textMuted} mb-2`}>Original ({LANGUAGE_LABELS[language]})</p>
                          <pre className={`${T.editorBg} font-mono border ${T.border} rounded-xl p-4 text-[13px] overflow-auto max-h-48 sm:max-h-64 whitespace-pre-wrap shadow-inner`}>{code}</pre>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${T.textMuted} mb-2`}>Converted ({LANGUAGE_LABELS[translateTarget]})</p>
                          <pre className={`${T.editorBg} font-mono border border-purple-500/30 rounded-xl p-4 text-[13px] overflow-auto max-h-48 sm:max-h-64 whitespace-pre-wrap shadow-inner`}>{translatedCode}</pre>
                        </div>
                      </div>
                      <button
                        onClick={applyTranslation}
                        className="mt-5 text-sm font-medium text-white bg-purple-600/90 border border-purple-500/50 backdrop-blur-md rounded-xl px-5 py-2.5 hover:bg-purple-600 shadow-xl shadow-purple-500/25 transition-all"
                      >
                        Apply Conversion
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Code editor */}
              <div className="flex-1 flex overflow-hidden min-h-0 relative z-0">
                <div
                  ref={lineNumbersRef}
                  className={`select-none text-right pr-2 sm:pr-4 pl-2 sm:pl-5 pt-5 text-[12px] sm:text-[13px] font-mono ${T.textFaint} ${T.lineNumBg} overflow-hidden backdrop-blur-sm border-r ${T.borderFaint} shrink-0`}
                >
                  {lines.map((_, i) => (
                    <div
                      key={i}
                      className={`leading-7 ${i + 1 === cursor.line ? 'text-purple-400 font-medium' : ''}`}
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
                  className={`flex-1 ${T.editorBg} ${T.text} font-mono text-[13px] sm:text-[14px] leading-7 outline-none resize-none p-3 sm:p-5 bg-transparent min-w-0`}
                />
                {/* Decorative minimap — only on genuinely wide screens */}
                <div className={`hidden xl:flex flex-col w-20 shrink-0 border-l ${T.minimapBorder} ${T.editorBg} px-3 pt-5 gap-1 overflow-hidden`}>
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
                      <div key={i} className={`h-1 rounded-full ${tone} transition-all`} style={{ width: `${w}%` }} />
                    );
                  })}
                </div>
              </div>

              {/* Status bar */}
              <div className={`flex items-center justify-between px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-medium text-purple-100 backdrop-blur-md border-t shrink-0 z-10 shadow-[0_-4px_20px_-5px_rgba(147,51,234,0.2)] ${T.statusBarBg}`}>
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                  <span className="opacity-90 shrink-0">Ln {cursor.line}, Col {cursor.col}</span>
                  <span className="hidden sm:inline opacity-90 font-semibold">{LANGUAGE_LABELS[language] || language}</span>
                  <span className="hidden md:inline opacity-90">UTF-8</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                  <span className="opacity-90">{lineCount} lines</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className={`px-6 sm:px-8 py-6 rounded-3xl ${T.panelBg} border ${T.border} flex flex-col items-center gap-3 text-center`}>
                <Code2 size={32} className="text-purple-500/80" />
                <p className={`text-sm sm:text-base font-medium ${T.textMuted}`}>
                  Select a snippet or create a new one to get started
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`lg:hidden flex items-center gap-1.5 text-xs font-medium text-purple-500 mt-1`}
                >
                  <Menu size={14} />
                  Open snippets
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diagram modal */}
      {diagramOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className={`${T.panelBg} border ${T.border} shadow-2xl rounded-3xl p-4 sm:p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`${T.textStrong} font-bold flex items-center gap-2 text-lg sm:text-xl`}>
                <GitBranch size={20} className="text-purple-500" />
                Logic Diagram
              </h3>
              <button onClick={() => setDiagramOpen(false)} className={`p-2 rounded-xl ${T.hoverBg} ${T.textMuted} ${T.hoverText} transition-colors`}>
                <X size={20} />
              </button>
            </div>
            {diagramLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 size={32} className="animate-spin text-purple-500" />
                <p className={`text-sm sm:text-base font-medium ${T.textMuted}`}>Analyzing code and generating diagram...</p>
              </div>
            ) : diagramChart ? (
              <div className={`p-3 sm:p-5 rounded-2xl ${T.editorBg} border ${T.border} overflow-x-auto`}>
                <MermaidDiagram chart={diagramChart} />
              </div>
            ) : (
              <p className={`text-sm sm:text-base font-medium ${T.textMuted} text-center py-12`}>Could not generate a diagram.</p>
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