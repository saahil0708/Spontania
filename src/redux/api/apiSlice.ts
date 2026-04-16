import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // Cookies are handled automatically with credentials: 'include'
      return headers;
    },
    credentials: 'include', // Important for HttpOnly cookies
  }),
  tagTypes: ['Admin', 'Event', 'Team', 'Score', 'Winner'],
  endpoints: (builder) => ({}),
});
