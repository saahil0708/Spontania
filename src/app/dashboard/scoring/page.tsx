'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, Typography, Container, Grid, Paper, Stack, 
  TextField, MenuItem, Button, CircularProgress, 
  Avatar, Card, CardContent, Divider
} from '@mui/material';
import { TrophyIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useGetEventsQuery } from '@/redux/features/eventsApi';
import { useGetTeamsQuery } from '@/redux/features/teamsApi';
import { useGetScoresByEventQuery, useAddOrUpdateScoreMutation } from '@/redux/features/scoresApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const TEAM_COLORS: { [key: string]: string } = {
  white: '#f8fafc',
  red: '#fee2e2',
  blue: '#dbeafe',
  green: '#dcfce7'
};

const TEAM_BORDER: { [key: string]: string } = {
  white: '#cbd5e1',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e'
};

export default function ScoringPage() {
  const searchParams = useSearchParams();
  const eventIdFromQuery = searchParams.get('eventId');
  const [selectedEventId, setSelectedEventId] = useState('');
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery();
  const { data: teamsResponse, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: scoresResponse, isLoading: scoresLoading, refetch: refetchScores } = useGetScoresByEventQuery(selectedEventId, {
    skip: !selectedEventId
  });
  const [addOrUpdateScore] = useAddOrUpdateScoreMutation();

  const [scoresData, setScoresData] = useState<{ [key: string]: string }>({});

  const events = eventsResponse?.data || [];
  const teams = teamsResponse?.data || [];
  const existingScores = scoresResponse?.data || [];

  useEffect(() => {
    if (eventIdFromQuery) {
      setSelectedEventId(eventIdFromQuery);
    }
  }, [eventIdFromQuery]);

  useEffect(() => {
    if (existingScores && existingScores.length > 0) {
      const initialScores: any = {};
      existingScores.forEach((s: any) => {
        if (s.team) {
          initialScores[s.team._id] = s.score;
        }
      });
      setScoresData(initialScores);
    } else if (scoresResponse?.success) {
      setScoresData({});
    }
  }, [scoresResponse?.data]);

  const handleScoreChange = (teamId: string, value: string) => {
    setScoresData(prev => ({
      ...prev,
      [teamId]: value
    }));
  };

  const handleSaveAllScores = async () => {
    if (!selectedEventId) return;
    
    const loadingToast = toast.loading('Saving all scores...');
    try {
      const savePromises = teams.map((team: any) => {
        const score = scoresData[team._id] || "0";
        return addOrUpdateScore({
          eventId: selectedEventId,
          teamId: team._id,
          score,
          remarks: "" // Empty remarks as they are no longer used
        }).unwrap();
      });

      await Promise.all(savePromises);
      toast.success('All scores saved successfully', { id: loadingToast });
      refetchScores();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save some scores', { id: loadingToast });
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 6, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" color="primary" sx={{ mb: 4, fontWeight: 800 }}>Event Scoring</Typography>
            
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <TextField
                select
                label="Select Event to Score"
                fullWidth
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                disabled={eventsLoading}
                helperText="Select an event to start scoring the teams"
              >
                {events.map((event: any) => (
                  <MenuItem key={event._id} value={event._id}>
                    {event.name}
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Box>

          {!selectedEventId ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed', borderColor: 'divider' }}>
              <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" color="text.secondary">Please select an event to proceed with scoring.</Typography>
            </Paper>
          ) : teamsLoading || scoresLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={4}>
                {teams.map((team: any) => {
                  const score = scoresData[team._id] || "0";
                  const bgColor = TEAM_COLORS[team.color] || '#ffffff';
                  const borderColor = TEAM_BORDER[team.color] || 'divider';

                  return (
                    <Grid item xs={12} md={6} key={team._id}>
                      <Card sx={{ 
                        borderRadius: 4, 
                        borderLeft: `8px solid ${borderColor}`,
                        bgcolor: bgColor,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <Avatar sx={{ bgcolor: borderColor, width: 56, height: 56 }}>
                              <StarIcon className="w-8 h-8 text-white" />
                            </Avatar>
                            <Box>
                              <Typography variant="h5" sx={{ fontWeight: 800 }}>{team.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{team.institution}</Typography>
                            </Box>
                          </Stack>
                          
                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TrophyIcon className="w-4 h-4 text-orange-500" /> Current Score
                            </Typography>
                            <TextField
                              fullWidth
                              placeholder="Enter score (text or points)"
                              value={score}
                              onChange={(e) => handleScoreChange(team._id, e.target.value)}
                              slotProps={{
                                input: {
                                  sx: { bgcolor: 'white', borderRadius: 2, fontSize: '1.2rem', fontWeight: 700 }
                                }
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>

              {/* Sticky bottom save button */}
              <Box sx={{ 
                position: 'fixed', 
                bottom: 30, 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: 'auto',
                minWidth: 200
              }}>
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={handleSaveAllScores}
                  sx={{ 
                    borderRadius: 1, 
                    py: 1.5, 
                    fontSize: '1rem', 
                    fontWeight: 800,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                >
                  SAVE ALL CHANGES
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
