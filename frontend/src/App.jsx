import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Film } from 'lucide-react';

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-[#0f0f0f] text-white font-sans overflow-x-hidden">
        {/* Background ambient lighting (GenZ Cyberpunk Vibe) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[130px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

        <header className="px-8 py-5 flex justify-between items-center bg-[#0d0d0d]/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 shadow-2xl">
          <Link to="/" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 tracking-tighter hover:scale-105 transition-all flex items-center gap-2">
            <Film className="w-8 h-8 text-primary" /> CINEVERSE
          </Link>
          <nav className="flex items-center gap-8 font-bold text-sm text-gray-300">
            <Link to="/" className="hover:text-primary transition-all">Home</Link>
            <Link to="/movies" className="hover:text-primary transition-all">Movies</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl hover:text-white transition-all text-xs">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-red-500 hover:text-red-400 font-bold transition-all text-xs">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white transition-all">Login</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-b from-red-500 to-primary text-white rounded-xl shadow-[0_5px_15px_rgba(229,9,20,0.3)] hover:shadow-[0_8px_20px_rgba(229,9,20,0.5)] hover:-translate-y-0.5 transition-all text-xs">
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="p-8 max-w-7xl mx-auto relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
