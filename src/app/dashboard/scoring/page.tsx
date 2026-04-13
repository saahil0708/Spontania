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

  const [scoresData, setScoresData] = useState<{ [key: string]: { score: number; remarks: string } }>({});

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
        initialScores[s.team._id] = {
          score: s.score,
          remarks: s.remarks || ''
        };
      });
      setScoresData(initialScores);
    } else if (scoresResponse?.success) {
      setScoresData({});
    }
  }, [scoresResponse?.data]);

  const handleScoreChange = (teamId: string, value: string) => {
    const score = parseInt(value) || 0;
    setScoresData(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], score }
    }));
  };

  const handleRemarksChange = (teamId: string, value: string) => {
    setScoresData(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], remarks: value }
    }));
  };

  const handleSaveScore = async (teamId: string) => {
    if (!selectedEventId) return;
    try {
      const data = scoresData[teamId] || { score: 0, remarks: '' };
      await addOrUpdateScore({
        eventId: selectedEventId,
        teamId,
        score: data.score,
        remarks: data.remarks
      }).unwrap();
      toast.success('Score saved successfully');
      refetchScores();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save score');
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
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
                    {event.name} - {new Date(event.date).toLocaleDateString()}
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
            <Grid container spacing={4}>
              {teams.map((team: any) => {
                const teamData = scoresData[team._id] || { score: 0, remarks: '' };
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

                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TrophyIcon className="w-4 h-4 text-orange-500" /> Current Score
                            </Typography>
                            <TextField
                              type="number"
                              fullWidth
                              placeholder="Enter points"
                              value={teamData.score}
                              onChange={(e) => handleScoreChange(team._id, e.target.value)}
                              slotProps={{
                                input: {
                                  sx: { bgcolor: 'white', borderRadius: 2 }
                                }
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-500" /> Judge Remarks
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Add feedback or notes..."
                              value={teamData.remarks}
                              onChange={(e) => handleRemarksChange(team._id, e.target.value)}
                              slotProps={{
                                input: {
                                  sx: { bgcolor: 'white', borderRadius: 2 }
                                }
                              }}
                            />
                          </Box>

                          <Button 
                            variant="contained" 
                            fullWidth
                            onClick={() => handleSaveScore(team._id)}
                            sx={{ 
                              bgcolor: borderColor,
                            }}
                          >
                            Update Score
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
