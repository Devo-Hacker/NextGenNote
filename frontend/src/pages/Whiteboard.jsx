import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Undo2, Trash2, Save, Sun, Moon, Check } from 'lucide-react';
import { getWhiteboardById, createWhiteboard, updateWhiteboard } from '../api/whiteboards';

const MARKER_COLORS_LIGHT_BOARD = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];
const MARKER_COLORS_DARK_BOARD = ['#ffffff', '#f87171', '#60a5fa', '#4ade80', '#fbbf24', '#c084fc'];

const Whiteboard = () => {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawing = useRef(false);
  const currentStroke = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [boardColor, setBoardColor] = useState('white');
  const [activeColor, setActiveColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [boardId, setBoardId] = useState(isNew ? null : id);

  const palette = boardColor === 'white' ? MARKER_COLORS_LIGHT_BOARD : MARKER_COLORS_DARK_BOARD;

  useEffect(() => {
    if (!isNew) {
      const load = async () => {
        try {
          const res = await getWhiteboardById(id);
          setStrokes(res.data.strokes || []);
          setBoardColor(res.data.boardColor || 'white');
        } catch (err) {
          console.error('Failed to load whiteboard', err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isNew]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = boardColor === 'white' ? '#ffffff' : '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
  if (!stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [strokes, boardColor]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Resize canvas to fill its container, preserving drawing on resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redraw();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redraw]);

  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    const pos = getPointerPos(e);
    currentStroke.current = { color: activeColor, width: strokeWidth, points: [pos] };
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    const pos = getPointerPos(e);
    currentStroke.current.points.push(pos);

    // live-draw the current segment without re-rendering all strokes every move
    const ctx = canvasRef.current.getContext('2d');
    const pts = currentStroke.current.points;
    const len = pts.length;
    if (len < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = currentStroke.current.color;
    ctx.lineWidth = currentStroke.current.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(pts[len - 2].x, pts[len - 2].y);
    ctx.lineTo(pts[len - 1].x, pts[len - 1].y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentStroke.current && currentStroke.current.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke.current]);
    }
    currentStroke.current = null;
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  const handleToggleBoard = () => {
    setBoardColor((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (boardId) {
        await updateWhiteboard(boardId, { strokes, boardColor });
      } else {
        const res = await createWhiteboard({ strokes, boardColor });
        setBoardId(res.data._id);
        navigate(`/whiteboard/${res.data._id}`, { replace: true });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save whiteboard', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a10]">
        <p className="text-gray-400 text-sm">Loading whiteboard...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a10]">
      {/* Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-white/10 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Color palette */}
          <div className="flex items-center gap-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-1">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setActiveColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  activeColor === c ? 'scale-110 border-purple-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #ccc' : undefined }}
              />
            ))}
          </div>

          {/* Stroke width */}
          <input
            type="range"
            min="1"
            max="12"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-purple-600"
            title="Marker thickness"
          />

          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40"
          >
            <Undo2 size={14} />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={handleToggleBoard}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            {boardColor === 'white' ? <Moon size={14} /> : <Sun size={14} />}
            <span className="hidden sm:inline">{boardColor === 'white' ? 'Black board' : 'White board'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg px-4 py-1.5 hover:bg-purple-700 disabled:opacity-50"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};

export default Whiteboard;