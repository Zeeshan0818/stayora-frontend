import axiosClient from './axiosClient';

export const hotelApi = {
  search: ({
    city,
    startDate,
    endDate,
    roomCount,
    page = 0,
    size = 10,
  }) =>
    axiosClient
      .get('/hotels/search', {
        params: {
          city,
          startDate,
          endDate,
          roomCount,
          page,
          size,
        },
      })
      .then((r) => r.data.data),

  getInfo: (hotelId) =>
    axiosClient
      .get(`/hotels/${hotelId}/info`)
      .then((r) => r.data.data),
};