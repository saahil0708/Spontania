import { apiSlice } from '../api/apiSlice';

export const eventsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEvents: builder.query<any, void>({
            query: () => '/events',
            providesTags: ['Event'],
        }),
        createEvent: builder.mutation<any, any>({
            query: (data) => ({
                url: '/events',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Event'],
        }),
        updateEvent: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `/events/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Event'],
        }),
        deleteEvent: builder.mutation<any, string>({
            query: (id) => ({
                url: `/events/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Event'],
        }),
    }),
});

export const {
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
} = eventsApi;
