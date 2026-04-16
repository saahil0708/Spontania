'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, Typography, Container, Grid, Paper, Stack, 
  TextField, MenuItem, Button, CircularProgress, 
  Avatar, Card, CardContent, Divider, Tab, Tabs
} from '@mui/material';
import { TrophyIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useGetEventsQuery } from '@/redux/features/eventsApi';
import { useGetTeamsQuery } from '@/redux/features/teamsApi';
import { useGetScoresByEventQuery, useAddOrUpdateScoreMutation } from '@/redux/features/scoresApi';
import { useGetWinnersQuery, useDeclareWinnerMutation, useResetWinnersMutation } from '@/redux/features/winnersApi';
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

function ScoringContent() {
  const searchParams = useSearchParams();
  const eventIdFromQuery = searchParams.get('eventId');
  const [selectedEventId, setSelectedEventId] = useState('');
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery();
  const { data: teamsResponse, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: scoresResponse, isLoading: scoresLoading, refetch: refetchScores } = useGetScoresByEventQuery(selectedEventId, {
    skip: !selectedEventId
  });
  const [addOrUpdateScore] = useAddOrUpdateScoreMutation();
  const [activeTab, setActiveTab] = useState<'scoring' | 'winners'>('scoring');
  const [declareWinner] = useDeclareWinnerMutation();
  const [resetWinners] = useResetWinnersMutation();
  const { data: winnersResponse } = useGetWinnersQuery(undefined, {
    pollingInterval: 3000
  });

  const [scoresData, setScoresData] = useState<{ [key: string]: string }>({});

  const events = eventsResponse?.data || [];
  const teams = teamsResponse?.data || [];
  const existingScores = scoresResponse?.data || [];
  const winners = winnersResponse?.data || [];

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

  const handleDeclareWinner = async (teamId: string, type: 'Round' | 'Final', rank: number = 1) => {
    const loadingToast = toast.loading(`Declaring ${type} winner...`);
    try {
      await declareWinner({
        teamId,
        type,
        rank,
        eventId: type === 'Round' ? selectedEventId : undefined,
        category: type === 'Round' ? events.find((e: any) => e._id === selectedEventId)?.category : undefined
      }).unwrap();
      toast.success(`${type} winner declared! Scoreboard will update.`, { id: loadingToast });
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to declare winner', { id: loadingToast });
    }
  };

  const handleAutoDeclareWinner = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first");
      return;
    }

    let topScore = -1;
    let topTeamId = null;

    // existingScores comes from the query
    existingScores.forEach((s: any) => {
      const scoreVal = parseFloat(s.score) || 0;
      if (scoreVal > topScore) {
        topScore = scoreVal;
        topTeamId = s.team?._id;
      }
    });

    if (!topTeamId) {
      toast.error("No valid scores found to determine a winner.");
      return;
    }

    const teamName = teams.find((t: any) => t._id === topTeamId)?.name || "Selected Team";
    if (confirm(`Declare ${teamName} as the winner with ${topScore} points?`)) {
      await handleDeclareWinner(topTeamId, 'Round');
    }
  };

  const handleResetWinners = async () => {
    if (!confirm('Are you sure you want to clear all winners?')) return;
    try {
      await resetWinners().unwrap();
      toast.success('All winners cleared');
    } catch (err: any) {
      toast.error('Failed to reset winners');
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 30%, #fff7ed 70%, #f8fafc 100%)',
        minHeight: '100vh', 
        pt: 6, pb: 12,
        overflow: 'hidden'
      }}>
        {/* Dynamic Sporty Background Elements */}
        <Box sx={{ 
          position: 'absolute', top: -200, left: -100, width: 500, height: 1500, 
          bgcolor: 'primary.main', opacity: 0.02, transform: 'rotate(25deg)', pointerEvents: 'none'
        }} />
        <Box sx={{ 
          position: 'absolute', bottom: -100, right: -100, width: 300, height: 800, 
          bgcolor: 'secondary.main', opacity: 0.03, transform: 'rotate(-20deg)', pointerEvents: 'none'
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
              <Box sx={{ height: 80, display: 'flex', alignItems: 'center' }}>
                <img src="/assets/spontania_logo.png" alt="Spontania Logo" style={{ height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h4" color="primary" sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>Event Scoring</Typography>
            </Stack>
            
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)} 
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Event Scoring" value="scoring" sx={{ fontWeight: 800 }} />
                <Tab label="Winner Declaration" value="winners" sx={{ fontWeight: 800 }} />
              </Tabs>

              {activeTab === 'scoring' ? (
                <TextField
                  select
                  label="Select Event to Score"
                  fullWidth
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={eventsLoading}
                  helperText="Select an event to start scoring the teams"
                >
                  {/* Dynamically create categorized menu items */}
                  {['Fine Arts', 'Dance', 'Singing', 'Theatre'].map((cat) => {
                    const catEvents = events.filter((e: any) => (e.category === cat || (!e.category && cat === 'Others')));
                    if (catEvents.length === 0) return null;
                    
                    return [
                      <MenuItem key={`header-${cat}`} disabled sx={{ opacity: 1, fontWeight: 900, color: 'primary.main', bgcolor: 'action.hover', mt: 1 }}>
                        {cat.toUpperCase()}
                      </MenuItem>,
                      ...catEvents.map((event: any) => (
                        <MenuItem key={event._id} value={event._id} sx={{ pl: 4 }}>
                          {event.name}
                        </MenuItem>
                      ))
                    ];
                  })}
                </TextField>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Select an event above first if declaring a <strong>Round Winner</strong>. To declare <strong>Final Winners</strong>, just click the buttons below.
                  </Typography>
                  <TextField
                    select
                    label="Select Event for Round Winner"
                    fullWidth
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    disabled={eventsLoading}
                  >
                     {events.map((e: any) => (
                       <MenuItem key={e._id} value={e._id}>{e.name} ({e.category})</MenuItem>
                     ))}
                  </TextField>
                </Stack>
              )}
            </Paper>
          </Box>

          {activeTab === 'scoring' ? (
            <>
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
                    const score = scoresData[team._id] || "0";
                    const bgColor = TEAM_COLORS[team.color] || '#ffffff';
                    const borderColor = TEAM_BORDER[team.color] || 'divider';

                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={team._id}>
                        <Card sx={{ 
                          borderRadius: 4, 
                          borderLeft: `8px solid ${borderColor}`,
                          bgcolor: bgColor,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
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
              )}
            </>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: 3, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Declare Round Winner</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                      Automatically identifies the team with the highest score and triggers the "Grand Celebration".
                    </Typography>
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      disabled={!selectedEventId || existingScores.length === 0}
                      onClick={handleAutoDeclareWinner}
                      startIcon={<TrophyIcon className="w-5 h-5" />}
                      sx={{ py: 2, fontWeight: 900, borderRadius: 1, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                    >
                      IDENTIFY & ANNOUNCE WINNER
                    </Button>

                    <Divider sx={{ my: 4 }}>OR SELECT MANUALLY</Divider>

                    <Grid container spacing={2}>
                      {teams.map((team: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={team._id}>
                          <Button 
                            fullWidth 
                            variant="outlined" 
                            disabled={!selectedEventId}
                            onClick={() => handleDeclareWinner(team._id, 'Round')}
                            sx={{ borderColor: TEAM_BORDER[team.color], color: TEAM_BORDER[team.color], py: 1, fontWeight: 800 }}
                          >
                            {team.name}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, bgcolor: '#fff7ed', borderRadius: 3, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: '#9a3412' }}>Declare Final Winners</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                      Use these for the final 3 winners of the entire contest.
                    </Typography>
                    <Stack spacing={3}>
                      {[
                        { label: 'Grand Champion (1st)', rank: 1 },
                        { label: '1st Runner Up (2nd)', rank: 2 },
                        { label: '2nd Runner Up (3rd)', rank: 3 }
                      ].map((win) => (
                        <Box key={win.rank}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>{win.label}</Typography>
                          <Grid container spacing={2}>
                            {teams.map((team: any) => (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={team._id}>
                                <Button 
                                  fullWidth 
                                  variant="outlined"
                                  onClick={() => handleDeclareWinner(team._id, 'Final', win.rank)}
                                  sx={{ borderColor: TEAM_BORDER[team.color], color: TEAM_BORDER[team.color], fontWeight: 800 }}
                                >
                                  {team.name}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Announcement Log</Typography>
                <Stack spacing={2}>
                  {winners.map((w: any) => (
                    <Paper key={w._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{w.team.name} - {w.type === 'Round' ? `${w.event?.name || 'Event'}` : `Final Rank #${w.rank}`}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{new Date(w.createdAt).toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ 
                        px: 2, py: 0.5, borderRadius: 10, 
                        bgcolor: w.isAnnounced ? 'success.main' : 'warning.main',
                        color: 'white', fontSize: '0.75rem', fontWeight: 900
                      }}>
                        {w.isAnnounced ? 'DISPLAYED' : 'PENDING REVEAL'}
                      </Box>
                    </Paper>
                  ))}
                  {winners.length === 0 && <Typography sx={{ opacity: 0.5 }}>No winners declared yet.</Typography>}
                </Stack>
                
                <Button 
                   color="error" 
                   sx={{ mt: 6, fontWeight: 800 }} 
                   onClick={handleResetWinners}
                >
                  Reset All Winners (Emergency Use Only)
                </Button>
              </Box>
            </Box>
          )}

              {/* Sticky bottom save button */}
              {activeTab === 'scoring' && (
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
              )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}

export default function ScoringPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    }>
      <ScoringContent />
    </Suspense>
  );
}
