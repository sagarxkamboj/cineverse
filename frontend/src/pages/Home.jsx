import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Film, Search, Star, Play, Sparkles, Flame, Percent, ChevronRight } from 'lucide-react';
import { MovieGridSkeleton } from '../components/Skeletons';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed loading movies for homepage', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter movies based on search and genre
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || 
                         (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    return matchesSearch && matchesGenre;
  });

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure'];

  if (loading) {
    return (
      <div className="space-y-12 pb-16">
        <div className="h-64 bg-zinc-900/50 animate-pulse rounded-[2.5rem] border border-white/5"></div>
        <div className="space-y-4">
          <div className="h-8 bg-zinc-900/50 animate-pulse rounded w-1/4 border border-white/5"></div>
          <MovieGridSkeleton />
        </div>
      </div>
    );
  }

  const featuredMovie = movies[featuredIndex] || movies[0];

  return (
    <div className="space-y-12 pb-16 transform translate-z-10 animate-fade-in">
      
      {/* Featured Banner Hero - GenZ Wide Aspect */}
      {featuredMovie && (
        <div className="relative h-[480px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
          <div className="absolute inset-0 z-0">
            <img src={featuredMovie.posterUrl} alt={featuredMovie.title} className="w-full h-full object-cover object-center filter blur-md opacity-30 scale-105" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent z-10"></div>
          
          <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 z-20 gap-8">
            <div className="md:w-3/5 text-left space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-xs font-black tracking-widest uppercase">
                <Flame className="w-3.5 h-3.5" /> Trending Release
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tight drop-shadow-md">
                {featuredMovie.title}
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed max-w-xl line-clamp-3">
                {featuredMovie.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-300 font-semibold pt-2">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {featuredMovie.rating}/10</span>
                <span>{featuredMovie.genre}</span>
                <span>{featuredMovie.duration} min</span>
              </div>

              <div className="pt-6 space-x-4">
                <Link to={`/movie/${featuredMovie.id}`} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-red-600 text-white rounded-2xl font-bold text-md shadow-[0_10px_20px_rgba(229,9,20,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(229,9,20,0.5)] transition-all">
                  <Play className="w-5 h-5 fill-white" /> Get Tickets
                </Link>
                <button 
                  onClick={() => setFeaturedIndex((featuredIndex + 1) % movies.length)}
                  className="px-6 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold text-md transition-all hover:bg-white/10"
                >
                  Next Featured
                </button>
              </div>
            </div>

            {/* Poster Card mockup */}
            <div className="hidden md:block w-64 h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src={featuredMovie.posterUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Category Icons Bar - BookMyShow Vibe */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-4 border-y border-white/5">
        {[
          { label: 'Movies 🎬', bg: 'from-pink-500/10 to-red-500/15', text: 'text-red-400' },
          { label: 'Streams 📺', bg: 'from-blue-500/10 to-teal-500/15', text: 'text-teal-400' },
          { label: 'Events 🎟️', bg: 'from-purple-500/10 to-indigo-500/15', text: 'text-indigo-400' },
          { label: 'Sports ⚽', bg: 'from-yellow-500/10 to-orange-500/15', text: 'text-orange-400' },
          { label: 'Plays 🎭', bg: 'from-fuchsia-500/10 to-pink-500/15', text: 'text-fuchsia-400' },
          { label: 'Activities 🧗', bg: 'from-emerald-500/10 to-green-500/15', text: 'text-green-400' },
        ].map((cat, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-2xl bg-gradient-to-br ${cat.bg} border border-white/5 text-center font-bold hover:scale-105 cursor-pointer hover:border-white/10 transition-all ${cat.text}`}
          >
            {cat.label}
          </div>
        ))}
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Recommended Movies <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </h3>
          <p className="text-gray-400 mt-1.5 text-sm font-light">Catch the latest blockbusters and premium cinema experiences near you.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movie title or genre..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[#161616] border border-white/5 rounded-xl focus:outline-none focus:border-primary text-white text-sm"
            />
          </div>

          {/* Genre Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase border transition-all ${
                  selectedGenre === genre
                    ? 'bg-primary border-primary text-white shadow-[0_4px_12px_rgba(229,9,20,0.3)]'
                    : 'bg-[#161616] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Recommended Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="p-16 text-center bg-white/5 rounded-3xl border border-white/5 text-gray-400">
          No matches found for your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredMovies.map(movie => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative block perspective-[1000px]">
              <div className="bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-lg transform-style-3d transition-transform duration-500 group-hover:rotate-x-[4deg] group-hover:rotate-y-[-4deg] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(229,9,20,0.25)]">
                
                {/* Poster Box */}
                <div className="h-80 bg-gray-900 relative overflow-hidden">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-tr from-gray-950 to-gray-900">No Image</div>
                  )}
                  {/* Rating Tag */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-primary text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" /> {movie.rating ? movie.rating.toFixed(1) : 'New'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h4 className="text-xl font-bold text-white mb-2 truncate group-hover:text-primary transition-colors">{movie.title}</h4>
                  <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-4">
                    <span>{movie.genre}</span>
                    <span>{movie.duration} min</span>
                  </div>
                  
                  {/* Call to Action Inside Card */}
                  <div className="w-full py-2 bg-white/5 group-hover:bg-primary border border-white/5 group-hover:border-primary text-gray-300 group-hover:text-white rounded-xl text-center text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1">
                    Book Tickets <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Promos Banner section - GenZ Neon Style */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-r from-purple-800/20 via-indigo-950/40 to-blue-900/20 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-[-30px] left-[-30px] w-24 h-24 rounded-full bg-purple-500/20 blur-xl"></div>
        <div className="absolute bottom-[-30px] right-[-30px] w-32 h-32 rounded-full bg-blue-500/20 blur-xl"></div>
        
        <div className="text-left space-y-2 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Percent className="w-3 h-3" /> Special Code
          </span>
          <h4 className="text-2xl font-black text-white tracking-tight">CinePass GenZ Discount</h4>
          <p className="text-gray-400 text-sm font-light">Get <span className="text-purple-400 font-bold">50% discount</span> on weekday tickets for all IMAX theaters. Use code <span className="text-white font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">GENZ50</span></p>
        </div>
        
        <Link to="/movies" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(147,51,234,0.3)] hover:scale-105 transition-all z-10 flex items-center gap-1.5">
          See Showtimes <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
