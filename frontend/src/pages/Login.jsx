import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, LogIn, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
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
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail) => {
    setError('');
    setLoading(true);
    try {
      await login({ email: quickEmail, password: 'password' });
      navigate('/dashboard');
    } catch (err) {
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center py-12 gap-12 max-w-5xl mx-auto transform translate-z-10 animate-fade-in">
      
      {/* Login Form Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#181818] to-black/60 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        <div className="absolute top-[-40px] right-[-40px] w-24 h-24 rounded-full bg-primary/20 blur-2xl"></div>
        
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            Login Gateway <LogIn className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-gray-400 mt-2 text-sm font-light">Access your Cineverse entertainment portal.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center mb-6 font-semibold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all" 
                placeholder="yourname@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-md shadow-[0_8px_20px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(229,9,20,0.5)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Authenticate Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          New to the portal? <Link to="/register" className="text-primary font-bold hover:underline">Register Here &rarr;</Link>
        </p>
      </div>

      {/* Quick Login Guide (GenZ Panel) */}
      <div className="w-full max-w-sm flex flex-col gap-5 text-left bg-gradient-to-br from-purple-900/10 to-indigo-950/20 border border-purple-500/10 p-8 rounded-[2rem] shadow-xl">
        <div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 w-max">
            <Shield className="w-3.5 h-3.5" /> Testing Sandbox
          </span>
          <h3 className="text-2xl font-black text-white mt-3 leading-tight">Quick Login Gateway</h3>
          <p className="text-gray-400 text-sm mt-1.5 font-light">Skip manual typing! Click below to immediately sign in as one of the pre-seeded users.</p>
        </div>

        <div className="space-y-3 pt-3">
          {[
            { role: 'Standard User', email: 'user@cineverse.com', desc: 'Book tickets, choose seats, and review movies.', bg: 'hover:border-red-500/30 hover:bg-red-500/5' },
            { role: 'Theatre Owner', email: 'owner@cineverse.com', desc: 'Create theatres and schedule showtimes.', bg: 'hover:border-purple-500/30 hover:bg-purple-500/5' },
            { role: 'Platform Admin', email: 'admin@cineverse.com', desc: 'Register releases and view booking logs.', bg: 'hover:border-indigo-500/30 hover:bg-indigo-500/5' },
          ].map(acc => (
            <button
              key={acc.email}
              onClick={() => handleQuickLogin(acc.email)}
              disabled={loading}
              className={`w-full p-4 text-left rounded-xl border border-white/5 bg-black/20 flex items-center justify-between group/btn transition-all duration-300 ${acc.bg}`}
            >
              <div>
                <p className="font-bold text-white text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary" /> {acc.role}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-normal pr-4">{acc.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
