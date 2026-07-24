import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Play, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';

const FEATURES = ['Free / Open Source', 'Graph Builder', 'Custom Collections', 'AI Canvas'];
const MOODS = ['😊 Happy', '😔 Sad', '😰 Anxious'];

const Landing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a10] relative overflow-hidden">
      <style>{`
        .landing-glow { position: absolute; border-radius: 9999px; filter: blur(110px); pointer-events: none; }
        .landing-grid { background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }
        .cta-primary { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); box-shadow: 0 8px 24px rgba(216, 70, 200, 0.35); }
      `}</style>

      <div className="landing-glow w-[500px] h-[500px] bg-purple-500/20 -top-32 -left-32" />
      <div className="landing-glow w-[400px] h-[400px] bg-fuchsia-500/15 top-1/4 -right-32" />
      <div className="absolute inset-0 landing-grid pointer-events-none" />

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white">NextGenNote</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="cta-primary text-sm font-medium text-white rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative max-w-3xl mx-auto text-center px-6 pt-12 pb-16">
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">
          Don't think, <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">do more.</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          This isn't a regular notepad. Share how you feel and let AI write the note for you —
          then connect your thoughts into a living graph of ideas.
        </p>

        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => navigate('/signup')}
            className="cta-primary flex items-center gap-2 text-sm font-medium text-white rounded-lg px-6 py-3 transition-transform hover:scale-[1.03]"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm font-medium text-gray-200 border border-white/15 bg-white/5 rounded-lg px-6 py-3 hover:bg-white/10 transition-colors"
          >
            <Play size={14} />
            See Demo
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400 border-t border-white/10 pt-8">
          {FEATURES.map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <Check size={14} className="text-fuchsia-400" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Product preview */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Dashboard mockup */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-900/20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-gray-500">nextgennote.app/dashboard</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">All Notes <span className="text-gray-500 font-normal text-sm">— Hola, You</span></h3>
                  <p className="text-xs text-gray-500 mt-0.5">7 notes · 1 pinned</p>
                </div>
                <div className="cta-primary text-xs font-medium text-white rounded-lg px-3 py-1.5">+ New Note</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-gradient-to-br from-purple-900/40 to-[#1a0f28] border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">Things to work on...</p>
                    <span className="text-xs text-purple-300">📌</span>
                  </div>
                  <p className="text-xs text-purple-100/60 leading-relaxed">Dynamic responsive site, profile pictures, landing page...</p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-purple-900/40 to-[#1a0f28] border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">what is fragments?</p>
                    <span className="text-[10px] text-fuchsia-200 bg-fuchsia-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={9} /> AI
                    </span>
                  </div>
                  <p className="text-xs text-purple-100/60 leading-relaxed">I'm feeling really happy today, and I think it's because...</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Canvas mockup */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-50/[0.03] to-fuchsia-50/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl shadow-fuchsia-900/20 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Sparkles size={14} className="text-purple-400" />
                AI Canvas
              </div>
            </div>
            <div className="p-4 flex-1">
              <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase mb-2">How are you feeling?</p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {MOODS.map((m) => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-gray-300 bg-white/5">
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <MessageCircle size={20} className="text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 max-w-[180px]">
                  Start a conversation to see your thoughts reflected here.
                </p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-xs text-gray-500 flex-1">share your emotions...</span>
                <div className="w-7 h-7 rounded-lg cta-primary flex items-center justify-center">
                  <ArrowRight size={12} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;