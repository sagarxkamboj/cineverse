import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(formData);
      alert('Registration successful! Please login with your new credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 translate-z-10 transform animate-fade-in">
      
      <div className="w-full max-w-md bg-gradient-to-b from-[#181818] to-black/60 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        <div className="absolute bottom-[-40px] left-[-40px] w-24 h-24 rounded-full bg-purple-500/15 blur-2xl"></div>
        
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            Join Club <UserPlus className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-gray-400 mt-2 text-sm font-light font-sans">Create your Cineverse account to unlock ticket booking.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center mb-6 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                name="name"
                onChange={handleChange} 
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all" 
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                name="email"
                onChange={handleChange} 
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all" 
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                name="password"
                onChange={handleChange} 
                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-xs font-bold uppercase tracking-wider">Portal Role Access</label>
            <select 
              name="role" 
              onChange={handleChange} 
              className="w-full p-3 bg-black/40 border border-white/5 focus:border-primary rounded-xl focus:outline-none text-white text-sm transition-all"
            >
              <option value="USER">Standard User (Book tickets)</option>
              <option value="THEATRE_OWNER">Theatre Owner (Manage theaters)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-md shadow-[0_8px_20px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(229,9,20,0.5)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Register Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login Gateway &rarr;</Link>
        </p>
      </div>

    </div>
  );
}
