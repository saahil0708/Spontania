import { apiSlice } from '../api/apiSlice';

export const scoresApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getScoresByEvent: builder.query<any, string>({
            query: (eventId) => `/scores/event/${eventId}`,
            providesTags: ['Score'],
        }),
        getAllScores: builder.query<any, void>({
            query: () => '/scores/all',
            providesTags: ['Score'],
        }),
        addOrUpdateScore: builder.mutation<any, { eventId: string; teamId: string; score: string; remarks?: string }>({
            query: (data) => ({
                url: '/scores',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Score'],
        }),
    }),
});

export const { 
    useGetScoresByEventQuery, 
    useGetAllScoresQuery,
    useAddOrUpdateScoreMutation 
} = scoresApi;
