import { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import { Link } from 'react-router-dom';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold">Loading Movies...</div>;

  return (
    <div className="py-10 transform translate-z-10">
      <h2 className="text-4xl font-extrabold mb-10 text-center drop-shadow-lg">Now Showing</h2>
      
      {movies.length === 0 ? (
        <div className="text-center text-gray-400">No movies currently available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {movies.map(movie => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative block perspective-[1000px]">
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 shadow-lg transform-style-3d transition-transform duration-500 group-hover:rotate-x-[5deg] group-hover:rotate-y-[-5deg] group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(229,9,20,0.3)]">
                <div className="h-80 bg-gray-800 relative">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-tr from-gray-900 to-gray-800">No Poster</div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {movie.rating ? `${movie.rating}/10` : 'New'}
                  </div>
                </div>
                <div className="p-6 transform translate-z-[30px]">
                  <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{movie.genre}</span>
                    <span>{movie.duration} min</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
