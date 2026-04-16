import { apiSlice } from '../api/apiSlice';

export const winnersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWinners: builder.query<any, void>({
            query: () => '/winners',
            providesTags: ['Winner'],
        }),
        declareWinner: builder.mutation<any, { teamId: string; eventId?: string; category?: string; rank: number; type: 'Round' | 'Final' }>({
            query: (data) => ({
                url: '/winners',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Winner'],
        }),
        announceWinner: builder.mutation<any, string>({
            query: (winnerId) => ({
                url: `/winners/announce/${winnerId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Winner'],
        }),
        resetWinners: builder.mutation<any, void>({
            query: () => ({
                url: '/winners/reset',
                method: 'DELETE',
            }),
            invalidatesTags: ['Winner'],
        }),
    }),
});

export const { 
    useGetWinnersQuery,
    useDeclareWinnerMutation,
    useAnnounceWinnerMutation,
    useResetWinnersMutation
} = winnersApi;
