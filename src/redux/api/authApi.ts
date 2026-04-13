import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => '/admin/me',
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
