import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Film, Plus, Trash, CreditCard, Star, User, 
  ShieldAlert, Calendar, DollarSign, MapPin, 
  TrendingUp, LogOut, FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  if (!user) return <Navigate to="/login" />;

  // General States
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States - User
  const [reviewForm, setReviewForm] = useState({ movieId: '', rating: 5, comment: '' });

  // Form States - Owner
  const [theatreForm, setTheatreForm] = useState({ name: '', location: '' });
  const [showForm, setShowForm] = useState({ movieId: '', theatreId: '', showTime: '', price: '', availableSeats: 80 });

  // Form States - Admin (Movie Creation)
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', genre: '', duration: '', rating: '', posterUrl: '', releaseDate: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load public/general info needed for mapping
      const moviesRes = await api.get('/movies');
      setMovies(moviesRes.data);

      const theatresRes = await api.get('/theatres');
      setTheatres(theatresRes.data);

      const showsRes = await api.get('/shows');
      setShows(showsRes.data);

      // Load bookings (will filter automatically based on backend role: my bookings for USER, all bookings for ADMIN)
      if (user.role === 'USER' || user.role === 'ADMIN') {
        const bookingsRes = await api.get('/bookings');
        setBookings(bookingsRes.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  // User Actions
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.movieId) {
      showToast("Please select a movie.", "warning");
      return;
    }
    try {
      await api.post('/reviews', {
        userId: user.id,
        movieId: parseInt(reviewForm.movieId),
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      });
      showToast('Review posted successfully!', "success");
      setReviewForm({ movieId: '', rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to post review', err);
      showToast('Failed to post review.', "error");
    }
  };

  // Owner Actions
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      await api.post('/theatres', {
        name: theatreForm.name,
        location: theatreForm.location,
        ownerId: user.id
      });
      showToast('Theatre added successfully!', "success");
      setTheatreForm({ name: '', location: '' });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to add theatre', err);
      showToast('Failed to add theatre.', "error");
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    if (!showForm.movieId || !showForm.theatreId) {
      showToast("Please select both a movie and a theatre.", "warning");
      return;
    }
    try {
      await api.post('/shows', {
        movieId: parseInt(showForm.movieId),
        theatreId: parseInt(showForm.theatreId),
        showTime: showForm.showTime,
        price: parseFloat(showForm.price),
        availableSeats: parseInt(showForm.availableSeats)
      });
      showToast('Show scheduled successfully!', "success");
      setShowForm({ movieId: '', theatreId: '', showTime: '', price: '', availableSeats: 80 });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to add show', err);
      showToast('Failed to schedule show.', "error");
    }
  };

  // Admin Actions
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await api.post('/movies', {
        title: movieForm.title,
        description: movieForm.description,
        genre: movieForm.genre,
        duration: parseInt(movieForm.duration),
        rating: parseFloat(movieForm.rating),
        posterUrl: movieForm.posterUrl,
        releaseDate: movieForm.releaseDate
      });
      showToast('Movie registered successfully!', "success");
      setMovieForm({ title: '', description: '', genre: '', duration: '', rating: '', posterUrl: '', releaseDate: '' });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to register movie', err);
      showToast('Failed to register movie.', "error");
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie? This will also remove any related shows/bookings.")) return;
    try {
      await api.delete(`/movies/${movieId}`);
      showToast('Movie deleted successfully!', "success");
      loadDashboardData();
    } catch (err) {
      console.error('Failed to delete movie', err);
      showToast('Failed to delete movie.', "error");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      showToast('Booking cancelled successfully!', "success");
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel booking.', "error");
    }
  };
  
  const handleDownloadPDF = (booking, show) => {
    const printWindow = window.open('', '_blank');
    const movieTitle = getMovieTitle(show.movieId);
    const theatreName = getTheatreName(show.theatreId);
    const showTimeStr = formatShowTime(show.showTime);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>CineVerse Ticket - #\${booking.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #000; color: #fff; padding: 40px; text-align: center; }
            .ticket { border: 2px dashed #e50914; border-radius: 20px; padding: 30px; max-width: 500px; margin: 0 auto; background: #111; box-shadow: 0 10px 30px rgba(229, 9, 20, 0.2); }
            h1 { color: #e50914; font-size: 32px; margin-bottom: 5px; font-weight: 900; letter-spacing: -1px; }
            .subtitle { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; }
            .movie { font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #fff; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin-bottom: 30px; border-top: 1px solid #222; border-bottom: 1px solid #222; padding: 20px 0; }
            .label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: bold; }
            .value { font-size: 15px; color: #ddd; font-weight: bold; margin-top: 5px; }
            .seat-box { background: #e50914; color: #fff; padding: 15px; border-radius: 12px; font-size: 24px; font-weight: 900; margin-bottom: 30px; display: inline-block; min-width: 120px; }
            .footer { font-size: 10px; color: #444; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1>CINEVERSE</h1>
            <div class="subtitle">Official Electronic Ticket</div>
            <div class="movie">\${movieTitle}</div>
            <div class="seat-box">SEAT \${booking.seatNumber}</div>
            <div class="details">
              <div>
                <div class="label">Theatre</div>
                <div class="value">\${theatreName}</div>
              </div>
              <div>
                <div class="label">Showtime</div>
                <div class="value">\${showTimeStr}</div>
              </div>
              <div>
                <div class="label">Booking ID</div>
                <div class="value">#\${booking.id}</div>
              </div>
              <div>
                <div class="label">Status</div>
                <div class="value" style="color: #10b981;">PAID / CONFIRMED</div>
              </div>
            </div>
            <div class="footer">THANK YOU FOR YOUR BOOKING. SCAN QR AT GATE.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- MAPPING HELPERS ---
  const getMovieTitle = (movieId) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.title : 'Unknown Movie';
  };

  const getMoviePoster = (movieId) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.posterUrl : null;
  };

  const getTheatreName = (theatreId) => {
    const theatre = theatres.find(t => t.id === theatreId);
    return theatre ? theatre.name : 'Unknown Theatre';
  };

  const getTheatreLocation = (theatreId) => {
    const theatre = theatres.find(t => t.id === theatreId);
    return theatre ? theatre.location : '';
  };

  const formatShowTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + 
           ' at ' + 
           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="py-8 transform translate-z-10 animate-fade-in">
      
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/20 text-primary rounded-2xl border border-primary/25">
            {user.role === 'ADMIN' ? <ShieldAlert className="w-8 h-8" /> : user.role === 'THEATRE_OWNER' ? <TrendingUp className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">Welcome, {user.email.split('@')[0]}</h2>
            <p className="text-gray-400 mt-1 text-sm">
              Role Level: <span className="text-primary font-bold tracking-widest uppercase text-xs px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20 ml-1.5">{user.role}</span>
            </p>
          </div>
        </div>
        <button onClick={logout} className="px-6 py-3 bg-[#222]/80 hover:bg-red-700/80 border border-white/5 hover:border-red-500/20 text-white rounded-xl flex items-center gap-2 transition-all font-semibold">
          <LogOut className="w-5 h-5" /> Logout Session
        </button>
      </div>

      {/* --- STANDARD USER PANEL --- */}
      {user.role === 'USER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* User's Booked Tickets */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary" /> Your Active Tickets
            </h3>
            
            {bookings.length === 0 ? (
              <div className="p-10 text-center bg-white/5 rounded-3xl border border-white/5">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No active movie bookings found.</p>
                <a href="/movies" className="inline-block mt-4 text-primary font-bold hover:underline">Book Your First Ticket &rarr;</a>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  const show = shows.find(s => s.id === booking.showId);
                  if (!show) return null;
                  const poster = getMoviePoster(show.movieId);
                  return (
                    <div key={booking.id} className="relative bg-[#161616] rounded-2xl border border-white/10 overflow-hidden flex shadow-lg hover:shadow-primary/5 transition-all">
                      {/* Stylized Ticket Cut */}
                      <div className="absolute right-[25%] top-[-8px] w-4 h-4 bg-[#0f0f0f] rounded-full border-b border-white/10 z-20"></div>
                      <div className="absolute right-[25%] bottom-[-8px] w-4 h-4 bg-[#0f0f0f] rounded-full border-t border-white/10 z-20"></div>
                      <div className="absolute right-[25%] top-2 bottom-2 border-r border-dashed border-white/10"></div>

                      <div className="w-1/4 bg-gray-900 overflow-hidden hidden sm:block">
                        {poster ? (
                          <img src={poster} alt="Movie poster" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-950">No Poster</div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-2xl font-black text-white tracking-tight leading-none mb-3">{getMovieTitle(show.movieId)}</h4>
                          <p className="text-primary font-extrabold text-sm uppercase flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {getTheatreName(show.theatreId)}
                          </p>
                          <p className="text-gray-400 text-xs mt-1.5 font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {formatShowTime(show.showTime)}
                          </p>
                        </div>
                        <div className="mt-6 flex justify-between items-end border-t border-white/5 pt-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest block font-bold">Seat Number</span>
                            <span className="text-xl font-black text-white">{booking.seatNumber}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDownloadPDF(booking, show)} className="text-xs text-primary hover:text-red-400 font-bold bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all">
                              Download PDF
                            </button>
                            <button onClick={() => handleDeleteBooking(booking.id)} className="text-xs text-red-500 hover:text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all">
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="w-1/4 p-6 flex flex-col items-center justify-center bg-white/5">
                        <div className="w-16 h-16 bg-white p-1 rounded-lg">
                          {/* Simulated QR Code */}
                          <div className="w-full h-full bg-slate-900 flex flex-wrap gap-1 p-0.5">
                            {Array.from({ length: 16 }).map((_, idx) => (
                              <div key={idx} className={`w-3.5 h-3.5 rounded-sm ${idx % 3 === 0 || idx % 4 === 1 ? 'bg-white' : 'bg-transparent'}`}></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2 font-mono uppercase">Ticket #{booking.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User: Share Movie Review Form */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl">
            <h3 className="text-2xl font-black mb-6 text-white tracking-tight flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" /> Share CineReview
            </h3>
            
            <form onSubmit={handleAddReview} className="space-y-5">
              <div>
                <label className="block text-gray-400 mb-2 font-medium text-sm">Select Movie</label>
                <select
                  value={reviewForm.movieId}
                  onChange={(e) => setReviewForm({ ...reviewForm, movieId: e.target.value })}
                  className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                  required
                >
                  <option value="">-- Choose Now Showing --</option>
                  {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>{movie.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium text-sm">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium text-sm">Review Comments</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="4"
                  placeholder="Enter details of your cinema experiences..."
                  className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white placeholder-gray-600 text-sm"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(229,9,20,0.3)] hover:bg-red-700 transition-colors">
                Publish Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- THEATRE OWNER PANEL --- */}
      {user.role === 'THEATRE_OWNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Manage Theatres & Schedule Shows */}
          <div className="lg:col-span-7 space-y-8">
            {/* Theatres List */}
            <div>
              <h3 className="text-2xl font-black text-white mb-5 flex items-center gap-2.5">
                <Film className="w-6 h-6 text-primary" /> Owned Theatres
              </h3>
              
              {theatres.filter(t => t.ownerId === user.id).length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 text-gray-400">
                  You have not registered any theatres yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {theatres.filter(t => t.ownerId === user.id).map(theatre => (
                    <div key={theatre.id} className="p-5 bg-[#161616] rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{theatre.name}</h4>
                        <p className="text-gray-400 text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {theatre.location}</p>
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono mt-4">ID: {theatre.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Shows Schedule */}
            <div>
              <h3 className="text-2xl font-black text-white mb-5 flex items-center gap-2.5">
                <Calendar className="w-6 h-6 text-primary" /> Scheduled Shows
              </h3>
              
              {shows.filter(s => theatres.some(t => t.id === s.theatreId && t.ownerId === user.id)).length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 text-gray-400">
                  No show times currently scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {shows.filter(s => theatres.some(t => t.id === s.theatreId && t.ownerId === user.id)).map(show => (
                    <div key={show.id} className="p-4 bg-[#161616] border border-white/5 rounded-xl flex items-center justify-between flex-wrap gap-4 text-sm">
                      <div>
                        <p className="font-bold text-white text-base">{getMovieTitle(show.movieId)}</p>
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                          <span>{getTheatreName(show.theatreId)}</span> &bull; <span>{formatShowTime(show.showTime)}</span>
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-emerald-400 font-bold">{show.availableSeats} Seats</span>
                        <span className="bg-primary/15 text-primary border border-primary/20 font-bold px-2 py-1 rounded-md text-xs">${show.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Add Theatre & Schedule Show Forms */}
          <div className="lg:col-span-5 space-y-8">
            {/* Add Theatre */}
            <div className="bg-gradient-to-b from-white/5 to-transparent p-6 rounded-3xl border border-white/10 shadow-xl">
              <h3 className="text-xl font-black mb-5 text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Register New Theatre
              </h3>
              <form onSubmit={handleAddTheatre} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Theatre Name</label>
                  <input type="text" value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" placeholder="e.g. IMAX Grand Dome" required />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Location</label>
                  <input type="text" value={theatreForm.location} onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" placeholder="e.g. New York, NY" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-md">
                  Register Theatre
                </button>
              </form>
            </div>

            {/* Schedule Show */}
            <div className="bg-gradient-to-b from-white/5 to-transparent p-6 rounded-3xl border border-white/10 shadow-xl">
              <h3 className="text-xl font-black mb-5 text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Schedule Show Time
              </h3>
              <form onSubmit={handleAddShow} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Select Movie</label>
                  <select value={showForm.movieId} onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                          className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" required>
                    <option value="">-- Choose Movie --</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Select Theatre</label>
                  <select value={showForm.theatreId} onChange={(e) => setShowForm({ ...showForm, theatreId: e.target.value })}
                          className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" required>
                    <option value="">-- Choose Theatre --</option>
                    {theatres.filter(t => t.ownerId === user.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Ticket Price ($)</label>
                    <input type="number" step="0.01" value={showForm.price} onChange={(e) => setShowForm({ ...showForm, price: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" placeholder="15.00" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Seats Capacity</label>
                    <input type="number" value={showForm.availableSeats} onChange={(e) => setShowForm({ ...showForm, availableSeats: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" placeholder="80" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Show Date & Time</label>
                  <input type="datetime-local" value={showForm.showTime} onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white text-sm" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm shadow-md">
                  Schedule Show
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* --- ADMIN PANEL --- */}
      {user.role === 'ADMIN' && (
        <div className="space-y-8">
          
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Movies</span>
                <p className="text-3xl font-black text-white mt-1">{movies.length}</p>
              </div>
              <Film className="w-8 h-8 text-primary opacity-60" />
            </div>
            <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Active Theatres</span>
                <p className="text-3xl font-black text-white mt-1">{theatres.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-primary opacity-60" />
            </div>
            <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Shows Scheduled</span>
                <p className="text-3xl font-black text-white mt-1">{shows.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-60" />
            </div>
            <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Bookings</span>
                <p className="text-3xl font-black text-white mt-1">{bookings.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>
          </div>

          {/* SVG Charts Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Revenue Trends */}
            <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 space-y-4 shadow-lg">
              <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Revenue Growth Trend (Last 7 Days)
              </h4>
              <div className="h-60 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e50914" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e50914" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="150" x2="400" y2="150" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
                  
                  {/* Area under the path */}
                  <path d="M 0 200 L 0 170 Q 70 120 130 140 Q 200 80 270 90 Q 330 40 400 30 L 400 200 Z" fill="url(#chartGlow)" />
                  
                  {/* Trend Line */}
                  <path d="M 0 170 Q 70 120 130 140 Q 200 80 270 90 Q 330 40 400 30" fill="none" stroke="#e50914" strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* Dot Highlights */}
                  <circle cx="130" cy="140" r="5" fill="#e50914" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="270" cy="90" r="5" fill="#e50914" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="400" cy="30" r="5" fill="#e50914" stroke="#ffffff" strokeWidth="2" />
                </svg>
                <div className="absolute top-2 left-3 bg-primary/15 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded text-[10px]">$12,450.00 Peak</div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Chart 2: Booking Distribution by Genre */}
            <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 space-y-4 shadow-lg">
              <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Bookings by Genre (Popularity)
              </h4>
              <div className="h-60 w-full relative flex items-end justify-between px-4 pt-10 border-b border-white/5">
                {[
                  { genre: 'Sci-Fi', pct: 85, color: 'bg-primary' },
                  { genre: 'Action', pct: 60, color: 'bg-purple-600' },
                  { genre: 'Drama', pct: 40, color: 'bg-yellow-500' },
                  { genre: 'Comedy', pct: 30, color: 'bg-emerald-500' },
                  { genre: 'Romance', pct: 15, color: 'bg-blue-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 w-12 group">
                    <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{item.pct}%</span>
                    <div style={{ height: `${item.pct * 1.5}px` }} className={`w-8 rounded-t-lg transition-all duration-500 group-hover:scale-y-105 ${item.color}`}></div>
                    <span className="text-[10px] font-semibold text-zinc-500 tracking-tight mt-1">{item.genre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Movies List & Bookings Log */}
            <div className="lg:col-span-7 space-y-8">
              {/* Movies Manager */}
              <div>
                <h3 className="text-2xl font-black text-white mb-5 flex items-center gap-2">
                  <Film className="w-6 h-6 text-primary" /> Movie Catalog Manager
                </h3>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {movies.map(movie => (
                    <div key={movie.id} className="p-4 bg-[#161616] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {movie.posterUrl && <img src={movie.posterUrl} alt="" className="w-10 h-14 object-cover rounded-md" />}
                        <div>
                          <p className="font-bold text-white text-base leading-tight">{movie.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{movie.genre} &bull; {movie.duration} min</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMovie(movie.id)} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bookings log */}
              <div>
                <h3 className="text-2xl font-black text-white mb-5 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" /> Master Booking Log
                </h3>
                
                {bookings.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 text-gray-400">
                    No tickets booked yet on the system.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {bookings.map(booking => {
                      const show = shows.find(s => s.id === booking.showId);
                      return (
                        <div key={booking.id} className="p-4 bg-[#161616] border border-white/5 rounded-xl flex items-center justify-between text-xs text-gray-400">
                          <div>
                            <p className="font-bold text-white text-sm mb-1">
                              Booking #{booking.id} &bull; User ID {booking.userId}
                            </p>
                            {show ? (
                              <span>
                                {getMovieTitle(show.movieId)} at {getTheatreName(show.theatreId)} &bull; Seat {booking.seatNumber}
                              </span>
                            ) : (
                              <span>Show details unavailable</span>
                            )}
                          </div>
                          <span className="text-gray-500 font-mono">
                            {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right: Add Movie Form */}
            <div className="lg:col-span-5 bg-gradient-to-b from-white/5 to-transparent p-8 rounded-3xl border border-white/10 shadow-xl">
              <h3 className="text-xl font-black mb-6 text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Register Movie Release
              </h3>
              
              <form onSubmit={handleAddMovie} className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Movie Title</label>
                  <input type="text" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" required />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Description</label>
                  <textarea value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} rows="3"
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Genre</label>
                    <input type="text" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" placeholder="Sci-Fi" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Duration (mins)</label>
                    <input type="number" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" placeholder="120" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Rating (eg 8.5)</label>
                    <input type="number" step="0.1" value={movieForm.rating} onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" placeholder="8.5" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Release Date</label>
                    <input type="date" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                           className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs font-semibold uppercase">Poster Image URL</label>
                  <input type="url" value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                         className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white" placeholder="https://..." required />
                </div>
                
                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors mt-2 shadow-md">
                  Register Movie Release
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
