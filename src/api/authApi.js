import axiosClient from './axiosClient';

export const authApi = {

  signup: ({ name, email, password, role }) =>
    axiosClient
      .post('/auth/signup', { name, email, password, role })
      .then((r) => r.data.data),

  login: ({ email, password }) =>
    axiosClient
      .post('/auth/login', { email, password })
      .then((r) => r.data.data),

  refresh: () =>
    axiosClient
      .post('/auth/refresh')
      .then((r) => r.data.data),

};
