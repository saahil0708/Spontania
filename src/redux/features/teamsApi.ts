import { apiSlice } from '../api/apiSlice';

export const teamsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTeams: builder.query<any, void>({
            query: () => '/teams',
            providesTags: ['Team'],
        }),
    }),
});

export const { useGetTeamsQuery } = teamsApi;
