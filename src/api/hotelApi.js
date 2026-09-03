import axiosClient from './axiosClient';

export const hotelApi = {
  browse: ({ city = '', page = 0, size = 9 } = {}) =>
    axiosClient
      .get('/hotels', {
        params: { city, page, size },
      })
      .then((r) => r.data.data),

  search: ({ city, startDate, endDate, roomCount, page = 0, size = 10 }) =>
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