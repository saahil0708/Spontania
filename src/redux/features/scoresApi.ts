import { apiSlice } from '../api/apiSlice';

export const scoresApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getScoresByEvent: builder.query<any, string>({
            query: (eventId) => `/scores/event/${eventId}`,
            providesTags: ['Score'],
        }),
        addOrUpdateScore: builder.mutation<any, { eventId: string; teamId: string; score: number; remarks?: string }>({
            query: (data) => ({
                url: '/scores',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Score'],
        }),
    }),
});

export const { useGetScoresByEventQuery, useAddOrUpdateScoreMutation } = scoresApi;
