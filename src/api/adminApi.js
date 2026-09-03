import axiosClient from './axiosClient';

export const adminApi = {
  createHotel: (hotelDto) =>
    axiosClient.post('/admin/hotels', hotelDto).then((r) => r.data.data),

  updateRoom: (hotelId, roomId, roomDto) =>
    axiosClient
      .put(`/admin/hotels/${hotelId}/rooms/${roomId}`, roomDto)
      .then((r) => r.data),

  getHotel: (hotelId) =>
    axiosClient.get(`/admin/hotels/${hotelId}`).then((r) => r.data.data),

  deleteHotel: (hotelId) =>
    axiosClient.delete(`/admin/hotels/${hotelId}`).then((r) => r.data.data),

  activateHotel: (hotelId) =>
    axiosClient.patch(`/admin/hotels/${hotelId}/activate`).then((r) => r.data.data),

  createRoom: (hotelId, roomDto) =>
    axiosClient.post(`/admin/hotels/${hotelId}/rooms`, roomDto).then((r) => r.data.data),

  getRooms: (hotelId) =>
    axiosClient.get(`/admin/hotels/${hotelId}/rooms`).then((r) => r.data.data),

  getRoom: (hotelId, roomId) =>
    axiosClient.get(`/admin/hotels/${hotelId}/rooms/${roomId}`).then((r) => r.data.data),

  deleteRoom: (hotelId, roomId) =>
    axiosClient.delete(`/admin/hotels/${hotelId}/rooms/${roomId}`).then((r) => r.data.data),
};