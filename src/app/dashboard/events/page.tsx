'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Typography, Button, Container, Grid, Paper, Stack, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, CircularProgress
} from '@mui/material';
import { 
  PlusIcon, CalendarIcon, MapPinIcon, 
  PencilIcon, TrashIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { 
  useGetEventsQuery, 
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useDeleteEventMutation 
} from '@/redux/features/eventsApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { format } from 'date-fns';

export default function EventsPage() {
  const router = useRouter();
  const { data: response, isLoading } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const events = response?.data || [];

  const handleOpen = (event: any = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        description: event.description || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({ name: '', description: '' });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent({ id: editingEvent._id, data: formData }).unwrap();
        toast.success('Event updated successfully');
      } else {
        await createEvent(formData).unwrap();
        toast.success('Event created successfully');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id).unwrap();
        toast.success('Event deleted successfully');
      } catch (err: any) {
        toast.error(err.data?.message || 'Failed to delete event');
      }
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography variant="h4" color="primary">Manage Events</Typography>
            </Stack>
            <Button 
              variant="contained" 
              startIcon={<PlusIcon className="w-5 h-5" />}
              onClick={() => handleOpen()}
              sx={{ px: 4 }}
            >
              Add New Event
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((event: any) => (
                <Grid item xs={12} md={6} lg={4} key={event._id}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{event.name}</Typography>
                        <Chip label={event.status} color={event.status === 'Completed' ? 'success' : 'primary'} size="small" />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {event.description}
                      </Typography>

                      <Box sx={{ mt: 'auto' }}>
                        {/* Extras removed per user request */}
                      </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="soft" 
                        color="secondary"
                        onClick={() => router.push(`/dashboard/scoring?eventId=${event._id}`)}
                        sx={{ fontSize: '0.75rem', fontWeight: 800 }}
                      >
                        Score points
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleOpen(event)}>
                          <PencilIcon className="w-5 h-5 text-blue-500" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(event._id)}>
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <Stack spacing={3}>
                  <TextField
                    label="Event Name"
                    fullWidth
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ px: 4 }}>
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
