import api from './api';

export const movieService = {
  getAllMovies: async () => {
    const response = await api.get('/movies');
    return response.data;
  },
  getMovieById: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  }
};
