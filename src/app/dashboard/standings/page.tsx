'use client';

import { useMemo } from 'react';
import { 
  Box, Typography, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Avatar,
  Stack, CircularProgress, Chip, useTheme
} from '@mui/material';
import { TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useGetTeamsQuery } from '@/redux/features/teamsApi';
import { useGetAllScoresQuery } from '@/redux/features/scoresApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const RANK_COLORS: { [key: number]: string } = {
  0: '#FFD700', // Gold
  1: '#C0C0C0', // Silver
  2: '#CD7F32', // Bronze
};

export default function StandingsPage() {
  const theme = useTheme();
  const { data: teamsResponse, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: scoresResponse, isLoading: scoresLoading } = useGetAllScoresQuery();

  const teams = teamsResponse?.data || [];
  const allScores = scoresResponse?.data || [];

  const standings = useMemo(() => {
    if (!teams.length) return [];

    // Initialize standings for each team
    const teamStats = teams.map((team: any) => ({
      ...team,
      totalPoints: 0,
      eventHistory: [] as any[]
    }));

    // Aggregate scores
    allScores.forEach((score: any) => {
      // Guard against orphaned scores (where team or event might have been deleted)
      if (!score.team || !score.event) return;

      const teamIndex = teamStats.findIndex((t: any) => t._id === score.team._id);
      if (teamIndex !== -1) {
        // Attempt to parse score as a number for the total tally
        const numericScore = parseFloat(score.score) || 0;
        teamStats[teamIndex].totalPoints += numericScore;
        teamStats[teamIndex].eventHistory.push({
          eventName: score.event.name,
          score: score.score, // Keep the original text for history
        });
      }
    });

    // Sort by total points descending
    return teamStats.sort((a: any, b: any) => b.totalPoints - a.totalPoints);
  }, [teams, allScores]);

  if (teamsLoading || scoresLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
            <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 3, display: 'flex' }}>
              <TrophyIcon className="w-8 h-8 text-white" />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Overall Standings</Typography>
              <Typography variant="body2" color="text.secondary">Real-time competition leaderboard across all events</Typography>
            </Box>
          </Stack>

          <Paper sx={{ borderRadius: 6, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 3 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Team</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Institution</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>Events Played</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>Total Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {standings.map((team: any, index: number) => (
                    <TableRow 
                      key={team._id}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: index < 3 ? RANK_COLORS[index] : 'action.selected',
                          color: index < 3 ? 'white' : 'text.primary',
                          fontWeight: 800,
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: team.color === 'white' ? '#cbd5e1' : 
                                       team.color === 'red' ? '#ef4444' : 
                                       team.color === 'blue' ? '#3b82f6' : '#22c55e',
                              width: 40,
                              height: 40
                            }}
                          >
                            {team.name[0]}
                          </Avatar>
                          <Typography sx={{ fontWeight: 700 }}>{team.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{team.institution}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={team.eventHistory.length} 
                          size="small" 
                          sx={{ fontWeight: 700, bgcolor: 'action.selected' }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {team.totalPoints.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Detailed Performance History */}
          <Box sx={{ mt: 8 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <ChartBarIcon className="w-6 h-6 text-gray-400" />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Performance Breakdown</Typography>
            </Stack>

            <Grid container spacing={4}>
              {standings.map((team: any) => (
                <Grid item xs={12} md={6} key={`history-${team._id}`}>
                  <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: team.color === 'white' ? '#cbd5e1' : 
                                       team.color === 'red' ? '#ef4444' : 
                                       team.color === 'blue' ? '#3b82f6' : '#22c55e' }} />
                      {team.name} History
                    </Typography>
                    <Stack spacing={1.5}>
                      {team.eventHistory.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No events scored yet.
                        </Typography>
                      ) : (
                        team.eventHistory.map((h: any, i: number) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{h.eventName}</Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 800 }}>{h.score}</Typography>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}

// Wrap in Grid for layout
import { Grid } from '@mui/material';
