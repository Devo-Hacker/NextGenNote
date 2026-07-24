import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LEFT — brand / visual side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0B0E1A]">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,0.25) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-violet-600/30 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-sky-500/20 blur-[110px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-400 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-white">NextGenNote</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
              Focus your mind,
              <br />
              amplify your notes.
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              The quiet workspace for deep thinking — NextGenNote turns
              scattered ideas into clear, connected knowledge.
            </p>
          </div>

          <div className="relative h-64 flex items-end">
            <svg viewBox="0 0 400 260" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shard1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="shard2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="shard3" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <polygon points="40,240 120,60 200,110 150,240" fill="url(#shard1)" stroke="rgba(139,92,246,0.5)" strokeWidth="1" />
              <polygon points="150,240 200,110 290,140 260,240" fill="url(#shard2)" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
              <polygon points="90,240 150,130 200,110 170,240" fill="url(#shard3)" stroke="rgba(196,181,253,0.4)" strokeWidth="1" />
              <line x1="120" y1="60" x2="200" y2="110" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <line x1="200" y1="110" x2="290" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>
          </div>

          <p className="text-xs text-slate-500">© 2026 NextGenNote AI</p>
        </div>
      </div>

      {/* RIGHT — form side (glass) */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-hidden bg-gray-50">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[26rem] h-[26rem] rounded-full bg-violet-300/50 blur-[100px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-sky-300/50 blur-[110px]" />
          <div className="absolute top-[35%] right-[10%] w-64 h-64 rounded-full bg-fuchsia-200/40 blur-[90px]" />
        </div>

        <div className="relative w-full max-w-sm bg-white/50 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.12)] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 justify-center mb-6 sm:mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-400 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">NextGenNote</span>
          </div>

          <div className="mb-6 sm:mb-7">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5">Welcome back</h1>
            <div className="w-10 h-1 rounded-full bg-gradient-to-r from-violet-500 to-sky-400 mb-3" />
            <p className="text-sm text-gray-600">Log in to pick up right where you left off.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full text-sm bg-white/60 border border-white/80 rounded-xl pl-10 pr-3 py-2.5 outline-none placeholder:text-gray-400 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm bg-white/60 border border-white/80 rounded-xl pl-10 pr-3 py-2.5 outline-none placeholder:text-gray-400 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-sky-500 text-white text-sm font-medium rounded-xl py-2.5 hover:shadow-lg hover:shadow-violet-300/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-violet-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;