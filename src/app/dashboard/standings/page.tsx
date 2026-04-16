'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Box, Typography, Container, CircularProgress, useTheme, Stack
} from '@mui/material';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useGetTeamsQuery } from '@/redux/features/teamsApi';
import { useGetAllScoresQuery } from '@/redux/features/scoresApi';
import { useGetEventsQuery } from '@/redux/features/eventsApi';
import { useGetWinnersQuery } from '@/redux/features/winnersApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StandingsDashboard from '@/components/dashboard/StandingsDashboard';

export default function StandingsPage() {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data: teamsResponse, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: scoresResponse, isLoading: scoresLoading } = useGetAllScoresQuery(undefined, {
    pollingInterval: 3000,
  });
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery();
  const { data: winnersResponse } = useGetWinnersQuery(undefined, {
    pollingInterval: 3000,
  });

  const teams = teamsResponse?.data || [];
  const allScores = scoresResponse?.data || [];
  const events = eventsResponse?.data || [];
  const winners = winnersResponse?.data || [];

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (teamsLoading || scoresLoading || eventsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ 
        width: '100%', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 30%, #fff7ed 70%, #f8fafc 100%)'
      }}>
        {/* Dynamic Sporty Background Elements are mostly hidden by the dashboard, but keeping it unified */}
        <Box sx={{ 
          position: 'absolute', top: -200, left: -100, width: 500, height: 1500, 
          bgcolor: 'primary.main', opacity: 0.02, transform: 'rotate(25deg)', pointerEvents: 'none'
        }} />
        <Box sx={{ 
          position: 'absolute', bottom: -100, right: -100, width: 300, height: 800, 
          bgcolor: 'secondary.main', opacity: 0.03, transform: 'rotate(-20deg)', pointerEvents: 'none'
        }} />
        <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 0 }}>
          {/* New Symmetric Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ height: 80, display: 'flex', alignItems: 'center' }}>
                <img src="/assets/spontania_logo.png" alt="Spontania Logo" style={{ height: '100%', objectFit: 'contain' }} />
              </Box>
            </Stack>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1, mb: 0.5 }}>
                {format(currentTime, 'p')}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                {format(currentTime, 'EEEE, do MMMM yyyy')}
              </Typography>
            </Box>
          </Box>

          {/* Main Dashboard - No Tabs */}
          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <StandingsDashboard teams={teams} allScores={allScores} events={events} winners={winners} />
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
