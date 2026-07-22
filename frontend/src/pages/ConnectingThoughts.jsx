import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Zap, Circle, Plus, FileText } from 'lucide-react';
import { getGraphData, createNote } from '../api/notes';
import { getCollections } from '../api/collections';

const WIDTH = 900;
const HEIGHT = 560;

const ConnectingThoughts = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [view, setView] = useState('all');
  const navigate = useNavigate();
  const simRef = useRef(null);
  const draggingRef = useRef(null);

  const colorFor = useCallback(
    (collectionId) => collections.find((c) => c._id === collectionId)?.color || '#a855f7',
    [collections]
  );

  const load = useCallback(async () => {
    try {
      const [graphRes, colRes] = await Promise.all([getGraphData(), getCollections()]);
      setCollections(colRes.data);

      const initNodes = graphRes.data.nodes.map((n, i) => ({
        ...n,
        x: WIDTH / 2 + Math.cos(i) * 150 + Math.random() * 40,
        y: HEIGHT / 2 + Math.sin(i) * 150 + Math.random() * 40,
        vx: 0,
        vy: 0,
      }));
      setNodes(initNodes);
      setEdges(graphRes.data.edges);
    } catch (err) {
      console.error('Failed to load graph', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const linkCount = useMemo(() => {
    const counts = {};
    edges.forEach((e) => {
      counts[e.source] = (counts[e.source] || 0) + 1;
      counts[e.target] = (counts[e.target] || 0) + 1;
    });
    return counts;
  }, [edges]);

  const clusterCount = useMemo(() => {
    const visited = new Set();
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.source]?.push(e.target);
      adj[e.target]?.push(e.source);
    });
    let clusters = 0;
    nodes.forEach((n) => {
      if (visited.has(n.id)) return;
      clusters++;
      const stack = [n.id];
      while (stack.length) {
        const cur = stack.pop();
        if (visited.has(cur)) continue;
        visited.add(cur);
        (adj[cur] || []).forEach((nb) => !visited.has(nb) && stack.push(nb));
      }
    });
    return clusters;
  }, [nodes, edges]);

  const visibleNodeIds = useMemo(() => {
    if (view === 'orphan') return new Set(nodes.filter((n) => !linkCount[n.id]).map((n) => n.id));
    if (view === 'strong') return new Set(nodes.filter((n) => (linkCount[n.id] || 0) >= 2).map((n) => n.id));
    return new Set(nodes.map((n) => n.id));
  }, [nodes, linkCount, view]);

  const visibleEdges = useMemo(
    () => edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)),
    [edges, visibleNodeIds]
  );

  // force simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    const tick = () => {
      setNodes((prevNodes) => {
        const next = prevNodes.map((n) => ({ ...n }));
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1400 / (dist * dist);
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
          }
        }
        edges.forEach((e) => {
          const a = next.find((n) => n.id === e.source);
          const b = next.find((n) => n.id === e.target);
          if (!a || !b) return;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 150) * 0.01;
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
        });
        next.forEach((n) => {
          if (draggingRef.current === n.id) return;
          n.vx += (WIDTH / 2 - n.x) * 0.001;
          n.vy += (HEIGHT / 2 - n.y) * 0.001;
          n.vx *= 0.85; n.vy *= 0.85;
          n.x += n.vx; n.y += n.vy;
          n.x = Math.max(40, Math.min(WIDTH - 40, n.x));
          n.y = Math.max(40, Math.min(HEIGHT - 40, n.y));
        });
        return next;
      });
      simRef.current = requestAnimationFrame(tick);
    };
    simRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(simRef.current);
  }, [edges, nodes.length]);

  const handleMouseDown = (id) => (e) => { e.stopPropagation(); draggingRef.current = id; };
  const handleMouseMove = (e) => {
    if (draggingRef.current === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    setNodes((prev) => prev.map((n) => (n.id === draggingRef.current ? { ...n, x, y, vx: 0, vy: 0 } : n)));
  };
  const handleMouseUp = () => { draggingRef.current = null; };

  const handleNewNote = async () => {
    try {
      const res = await createNote({ title: 'Untitled', content: '' });
      navigate(`/notes/${res.data._id}`);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const recentNodes = nodes.slice(-4).reverse();

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      <style>{`
        .glow-node { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.7)); }
        .glow-node-hub { filter: drop-shadow(0 0 14px rgba(168, 85, 247, 0.9)); }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-2 text-white font-semibold">
            <Share2 size={16} className="text-purple-400" />
            Connecting Thoughts
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatPill icon={<FileText size={13} />} value={nodes.length} label="Total Notes" />
          <StatPill icon={<Zap size={13} />} value={edges.length} label="Connections" />
          <StatPill icon={<Circle size={13} />} value={clusterCount} label="Clusters" />
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors ml-2"
          >
            <Plus size={14} />
            New Note
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left panel */}
        <div className="w-56 shrink-0 border-r border-white/10 px-4 py-5">
          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-2">View</p>
          <div className="space-y-1 mb-6">
            <ViewButton active={view === 'all'} onClick={() => setView('all')} icon={<Share2 size={13} />} label="All Connections" />
            <ViewButton active={view === 'strong'} onClick={() => setView('strong')} icon={<Zap size={13} />} label="Strong Links" />
            <ViewButton active={view === 'orphan'} onClick={() => setView('orphan')} icon={<Circle size={13} />} label="Orphan Nodes" />
          </div>

          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-2">Legend</p>
          <div className="space-y-2 mb-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 glow-node-hub" />
              Hub node
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 glow-node" />
              Active note
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
              Linked note
            </div>
          </div>

          <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-2">Recent</p>
          <div className="space-y-1">
            {recentNodes.length === 0 && <p className="text-xs text-gray-600">No notes yet</p>}
            {recentNodes.map((n) => (
              <button
                key={n.id}
                onClick={() => navigate(`/notes/${n.id}`)}
                className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md hover:bg-white/5 text-xs text-gray-300 truncate"
              >
                <FileText size={12} className="text-gray-500 shrink-0" />
                <span className="truncate">{n.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1 p-6">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading your thought graph...</p>
          ) : nodes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No notes to connect yet. Create some notes first, then link them from inside the editor.
            </p>
          ) : (
            <div className="bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-[560px] cursor-grab"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {visibleEdges.map((e, i) => {
                  const a = nodes.find((n) => n.id === e.source);
                  const b = nodes.find((n) => n.id === e.target);
                  if (!a || !b) return null;
                  return (
                    <line
                      key={i}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="url(#edgeGradient)"
                      strokeWidth={1.5}
                      opacity={0.6}
                    />
                  );
                })}

                <defs>
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {nodes.filter((n) => visibleNodeIds.has(n.id)).map((n) => {
                  const count = linkCount[n.id] || 0;
                  const isHub = count >= 3;
                  const radius = isHub ? 11 : count > 0 ? 8 : 5;
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x}, ${n.y})`}
                      onMouseDown={handleMouseDown(n.id)}
                      onMouseEnter={() => setHoveredNode(n.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => { e.stopPropagation(); navigate(`/notes/${n.id}`, { state: { from: 'connections' } }); }}
                      className="cursor-pointer"
                    >
                      <circle
                        r={hoveredNode === n.id ? radius + 3 : radius}
                        fill={count > 0 ? colorFor(n.collectionId) : '#6b7280'}
                        className={isHub ? 'glow-node-hub' : count > 0 ? 'glow-node' : ''}
                      />
                      <text
                        y={radius + 16}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={isHub ? 600 : 400}
                        className="fill-gray-200 pointer-events-none select-none"
                      >
                        {n.title}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Drag nodes to rearrange. Hover to see the title. Click a node to open that note.</span>
            <span>Scroll to zoom · Drag to pan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ icon, value, label }) => (
  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs">
    <span className="text-purple-400">{icon}</span>
    <span className="font-semibold text-white">{value}</span>
    <span className="text-gray-400">{label}</span>
  </div>
);

const ViewButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-purple-600/90 text-white'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default ConnectingThoughts;