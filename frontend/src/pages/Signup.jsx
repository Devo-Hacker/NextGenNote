import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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
        <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-sky-500/25 blur-[100px]" />
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-violet-600/20 blur-[110px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-400 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-white">NextGenNote</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
              Every idea,
              <br />
              connected.
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Create an account and let NextGenNote link your notes into a
              single web of understanding.
            </p>
          </div>

          <div className="relative h-64 flex items-end">
            <svg viewBox="0 0 400 260" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="node1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="node2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g stroke="rgba(148,163,255,0.35)" strokeWidth="1">
                <line x1="60" y1="200" x2="150" y2="120" />
                <line x1="150" y1="120" x2="240" y2="160" />
                <line x1="150" y1="120" x2="190" y2="50" />
                <line x1="240" y1="160" x2="330" y2="90" />
                <line x1="240" y1="160" x2="300" y2="220" />
                <line x1="60" y1="200" x2="130" y2="230" />
                <line x1="190" y1="50" x2="330" y2="90" />
              </g>
              <circle cx="150" cy="120" r="26" fill="url(#node1)" />
              <circle cx="240" cy="160" r="22" fill="url(#node2)" />
              <circle cx="330" cy="90" r="20" fill="url(#node1)" />
              <circle cx="60" cy="200" r="4" fill="#94A3FF" />
              <circle cx="150" cy="120" r="6" fill="#C4B5FD" />
              <circle cx="240" cy="160" r="5.5" fill="#7DD3FC" />
              <circle cx="190" cy="50" r="4" fill="#94A3FF" />
              <circle cx="330" cy="90" r="6" fill="#C4B5FD" />
              <circle cx="300" cy="220" r="4" fill="#7DD3FC" />
              <circle cx="130" cy="230" r="3.5" fill="#94A3FF" />
            </svg>
          </div>

          <p className="text-xs text-slate-500">© 2026 NextGenNote AI</p>
        </div>
      </div>

      {/* RIGHT — form side (glass) */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-hidden bg-gray-50">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-10%] w-[26rem] h-[26rem] rounded-full bg-sky-300/50 blur-[100px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-300/50 blur-[110px]" />
          <div className="absolute bottom-[30%] left-[15%] w-64 h-64 rounded-full bg-fuchsia-200/40 blur-[90px]" />
        </div>

        <div className="relative w-full max-w-sm bg-white/50 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.12)] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 justify-center mb-6 sm:mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-sky-400 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900">NextGenNote</span>
          </div>

          <div className="mb-6 sm:mb-7">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5">Create your account</h1>
            <div className="w-10 h-1 rounded-full bg-gradient-to-r from-sky-400 to-violet-500 mb-3" />
            <p className="text-sm text-gray-600">Start capturing your thoughts, your way.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full text-sm bg-white/60 border border-white/80 rounded-xl pl-10 pr-3 py-2.5 outline-none placeholder:text-gray-400 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

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
              className="w-full bg-gradient-to-r from-sky-500 to-violet-600 text-white text-sm font-medium rounded-xl py-2.5 hover:shadow-lg hover:shadow-sky-300/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : (
                <>
                  Sign Up <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;