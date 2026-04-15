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
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StandingsDashboard from '@/components/dashboard/StandingsDashboard';

export default function StandingsPage() {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data: teamsResponse, isLoading: teamsLoading } = useGetTeamsQuery();
  const { data: scoresResponse, isLoading: scoresLoading } = useGetAllScoresQuery();
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery();

  const teams = teamsResponse?.data || [];
  const allScores = scoresResponse?.data || [];
  const events = eventsResponse?.data || [];

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
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 2 }}>
        <Container maxWidth="xl">
          {/* New Symmetric Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 2, display: 'flex' }}>
                <TrophyIcon className="w-8 h-8 text-white" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>SPONTANIA</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Competition Analytics
                </Typography>
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
          <Box>
              <StandingsDashboard teams={teams} allScores={allScores} events={events} />
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
