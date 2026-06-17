import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { bookingService } from '../services/bookingService';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../services/api';
import { Calendar, Clock, DollarSign, MapPin, Tv, CheckCircle } from 'lucide-react';
import { MovieDetailsSkeleton } from '../components/Skeletons';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  const [showCheckout, setShowCheckout] = useState(false);
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    try {
      setLoading(true);
      // Fetch movie details
      const movieData = await movieService.getMovieById(id);
      setMovie(movieData);

      // Fetch shows for this movie
      const showsRes = await api.get(`/shows/movie/${id}`);
      setShows(showsRes.data);

      // Fetch all theatres to map theatre names
      const theatresRes = await api.get('/theatres');
      setTheatres(theatresRes.data);
    } catch (err) {
      console.error('Error fetching movie details', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booked seats when selected show changes
  useEffect(() => {
    if (selectedShow) {
      fetchBookedSeats(selectedShow.id);
      setSelectedSeat(null); // Reset selected seat
    }
  }, [selectedShow]);

  const fetchBookedSeats = async (showId) => {
    try {
      const res = await api.get(`/shows/${showId}/booked-seats`);
      setBookedSeats(res.data);
    } catch (err) {
      console.error('Error fetching booked seats', err);
    }
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

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // Seat is taken
    setSelectedSeat(seatId === selectedSeat ? null : seatId);
  };

  const getSeatCategory = (row) => {
    if (row === 'A') return { name: 'VIP', surcharge: 10.00, color: 'text-amber-400 border-amber-600/30 bg-amber-950/20 hover:border-amber-400' };
    if (row === 'B') return { name: 'Premium', surcharge: 5.00, color: 'text-purple-400 border-purple-600/30 bg-purple-950/20 hover:border-purple-400' };
    return { name: 'Regular', surcharge: 0.00, color: 'text-gray-400 border-white/5 bg-[#222] hover:border-primary' };
  };

  const getSeatPrice = (seatId) => {
    if (!selectedShow || !seatId) return 0;
    const row = seatId.charAt(0);
    const category = getSeatCategory(row);
    return selectedShow.price + category.surcharge;
  };

  const handleBook = async () => {
    if (!user) {
      showToast("Please login to book tickets", "warning");
      navigate('/login');
      return;
    }

    if (!selectedShow) {
      showToast("Please select a showtime", "warning");
      return;
    }

    if (!selectedSeat) {
      showToast("Please select a seat", "warning");
      return;
    }
    
    try {
      setBookingLoading(true);
      await api.post('/bookings/lock', {
        showId: selectedShow.id.toString(),
        seatNumber: selectedSeat,
        userId: user.id.toString()
      });
      showToast("Seat locked successfully for 5 minutes. Proceeding to checkout...", "success");
      setShowCheckout(true);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data || "Seat is already locked or selected by another user.", "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayment = async (success) => {
    if (!success) {
      showToast("Payment simulated failure. Transaction aborted.", "error");
      setShowCheckout(false);
      return;
    }

    try {
      setBookingLoading(true);
      await bookingService.createBooking({
        userId: user.id,
        showId: selectedShow.id,
        seatNumber: selectedSeat
      });
      showToast("Payment successful! Ticket booked successfully.", "success");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast("Failed to complete booking. Lock might have expired.", "error");
    } finally {
      setBookingLoading(false);
      setShowCheckout(false);
    }
  };

  if (loading) return <MovieDetailsSkeleton />;
  if (!movie) return <div className="text-center py-32 text-xl text-red-500 font-bold">Movie Not Found</div>;

  // Define seat layout: 4 rows (A, B, C, D), 8 columns (1 to 8)
  const rows = ['A', 'B', 'C', 'D'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="py-10 max-w-6xl mx-auto transform translate-z-10 animate-fade-in">
      {/* Movie Main Banner */}
      <div className="bg-[#161616]/80 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col md:flex-row mb-12">
        <div className="md:w-1/3 bg-gray-950 relative overflow-hidden group">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover min-h-[450px] transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full min-h-[450px] flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-900 to-black">No Poster</div>
          )}
          <div className="absolute top-6 right-6 bg-gradient-to-br from-red-500 to-primary text-white font-extrabold px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            {movie.rating ? `${movie.rating}/10` : 'New'}
          </div>
        </div>
        
        <div className="p-10 md:w-2/3 flex flex-col justify-between">
          <div>
            <h2 className="text-5xl font-black text-white mb-6 drop-shadow-md tracking-tight">{movie.title}</h2>
            
            <div className="flex flex-wrap gap-3 mb-8 font-medium">
              <span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm">{movie.genre || 'Uncategorized'}</span>
              <span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {movie.duration || '0'} min</span>
              <span className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {movie.releaseDate || 'TBA'}</span>
            </div>
            
            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">{movie.description || 'No description available for this movie.'}</p>
          </div>

          <div className="border-t border-white/5 pt-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Current State</p>
              <p className="text-lg text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-5 h-5" /> In Theaters Now
              </p>
            </div>
            {!user && (
              <p className="text-sm text-gray-400 italic">Please sign in to proceed with booking.</p>
            )}
          </div>
        </div>
      </div>

      {/* Showtime & Seat Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Step 1: Select Showtime */}
        <div className="lg:col-span-5 bg-[#161616]/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-xl">
          <h3 className="text-2xl font-black mb-6 text-white tracking-tight flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">1</span>
            Select Showtime
          </h3>

          {shows.length === 0 ? (
            <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5">
              <p className="text-gray-400">No scheduled shows found for this movie.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {shows.map(show => (
                <button
                  key={show.id}
                  onClick={() => setSelectedShow(show)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    selectedShow?.id === show.id
                      ? 'bg-gradient-to-br from-primary/25 to-red-500/10 border-primary/60 shadow-[0_0_20px_rgba(229,9,20,0.15)] translate-x-1'
                      : 'bg-[#202020]/40 border-white/5 hover:border-white/20 hover:bg-[#202020]/70'
                  }`}
                >
                  <div className="flex justify-between items-start w-full mb-3">
                    <span className="font-bold text-white text-lg flex items-center gap-1.5">
                      <Tv className="w-5 h-5 text-primary" /> {getTheatreName(show.theatreId)}
                    </span>
                    <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-lg text-sm border border-primary/20 flex items-center gap-0.5">
                      <DollarSign className="w-4 h-4" /> {show.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-500" /> {formatShowTime(show.showTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" /> {getTheatreLocation(show.theatreId)}
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-gray-500">
                    Available Seats: <span className="text-emerald-400">{show.availableSeats}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2 & 3: Seat Selector & Confirm */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {showCheckout ? (
            <div className="bg-[#161616]/90 backdrop-blur-3xl p-8 rounded-3xl border border-primary/20 shadow-[0_20px_50px_rgba(229,9,20,0.15)] text-center space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>
              <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 justify-center">
                Secure Checkout Portal
              </h3>
              <p className="text-gray-400 text-sm">Review your booking summary and simulate a payment transaction.</p>
              
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Movie</span>
                  <span className="text-white font-bold">{movie.title}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Theatre</span>
                  <span className="text-white font-bold">{getTheatreName(selectedShow.theatreId)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Show Time</span>
                  <span className="text-white font-bold">{formatShowTime(selectedShow.showTime)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Selected Seat</span>
                  <span className="text-primary font-black uppercase">{selectedSeat} ({getSeatCategory(selectedSeat.charAt(0)).name})</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500 font-bold">Total Amount Due</span>
                  <span className="text-emerald-400 text-2xl font-black">${getSeatPrice(selectedSeat).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-950/20 border border-yellow-500/25 rounded-2xl text-xs text-yellow-400 text-left leading-relaxed">
                ⚠️ <strong>Redis Seat Lock Active:</strong> This seat is currently held exclusively for you. You have <strong>5 minutes</strong> to complete the transaction before the lock expires.
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => handlePayment(true)}
                  disabled={bookingLoading}
                  className="py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
                >
                  {bookingLoading ? 'Processing...' : 'Simulate Success'}
                </button>
                <button
                  onClick={() => handlePayment(false)}
                  disabled={bookingLoading}
                  className="py-4 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
                >
                  Simulate Failure
                </button>
              </div>

              <button
                onClick={() => setShowCheckout(false)}
                disabled={bookingLoading}
                className="text-xs text-gray-500 hover:text-white font-bold transition-colors block mx-auto mt-4"
              >
                &larr; Cancel and Modify Seat Selection
              </button>
            </div>
          ) : selectedShow ? (
            <div className="bg-[#161616]/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-xl text-center">
              <h3 className="text-2xl font-black mb-8 text-white tracking-tight flex items-center gap-3 justify-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">2</span>
                Choose Your Seat
              </h3>

              {/* Theater Screen Visual */}
              <div className="relative w-full max-w-md mx-auto mb-12">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-primary to-blue-500 rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.6)]"></div>
                <p className="text-xs text-gray-500 mt-2 font-bold tracking-widest uppercase">SCREEN THIS WAY</p>
              </div>

              {/* Seats Grid */}
              <div className="flex flex-col gap-3 items-center mb-8">
                {rows.map(row => (
                  <div key={row} className="flex gap-3 items-center">
                    <span className="w-6 text-gray-500 font-bold text-sm">{row}</span>
                    <div className="flex gap-2">
                      {cols.map(col => {
                        const seatId = `${row}${col}`;
                        const isTaken = bookedSeats.includes(seatId);
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={col}
                            onClick={() => handleSeatClick(seatId)}
                            disabled={isTaken}
                            className={`w-9 h-9 text-xs font-extrabold rounded-lg flex items-center justify-center transition-all ${
                              isTaken 
                                ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-primary text-white scale-110 shadow-[0_0_12px_rgba(229,9,20,0.6)] border border-primary'
                                : getSeatCategory(row).color
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-gray-500 font-bold text-sm">{row}</span>
                  </div>
                ))}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap justify-center gap-6 text-xs mb-10 border-t border-white/5 pt-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-[#222] border border-white/5 rounded"></div>
                  <span className="text-gray-400">Regular</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-purple-950/20 border border-purple-500/20 rounded"></div>
                  <span className="text-purple-400">Premium (+$5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-yellow-950/20 border border-yellow-500/20 rounded"></div>
                  <span className="text-yellow-400">VIP (+$10)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-primary rounded"></div>
                  <span className="text-white">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-zinc-800 border border-zinc-700 rounded line-through"></div>
                  <span className="text-zinc-600 font-bold">Booked</span>
                </div>
              </div>

              {/* Booking Action */}
              {selectedSeat && (
                <div className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Selected Booking Summary</p>
                    <p className="text-lg text-white font-bold mt-1">
                      Seat <span className="text-primary">{selectedSeat}</span> ({getSeatCategory(selectedSeat.charAt(0)).name}) &bull; Total: <span className="text-emerald-400">${getSeatPrice(selectedSeat).toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">{formatShowTime(selectedShow.showTime)}</p>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl font-bold text-md shadow-[0_8px_20px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(229,9,20,0.5)] transition-all flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? 'Confirming...' : 'Book Ticket Now'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#161616]/40 backdrop-blur-2xl p-12 rounded-3xl border border-white/5 shadow-xl text-center flex flex-col items-center justify-center min-h-[400px]">
              <Tv className="w-16 h-16 text-gray-600 mb-4 animate-pulse" />
              <h4 className="text-xl font-bold text-white mb-2">Interactive Seating Grid</h4>
              <p className="text-gray-400 max-w-sm">Please select an available show time from the schedule list to unlock interactive seat map selection and proceed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
