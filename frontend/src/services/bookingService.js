import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getUserBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  }
};
