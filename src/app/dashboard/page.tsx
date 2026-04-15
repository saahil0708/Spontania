'use client';

import { Box, Typography, Button, Container, Grid, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/features/authSlice';
import { ArrowLeftOnRectangleIcon, TrophyIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <Box sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 30%, #fff7ed 70%, #f8fafc 100%)',
        minHeight: '100vh', 
        py: 6,
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box sx={{ height: 80, display: 'flex', alignItems: 'center' }}>
                <img src="/assets/spontania_logo.png" alt="Spontania Logo" style={{ height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h4" color="primary">ADMIN</Typography>
            </Stack>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Typography variant="h2" sx={{ mb: 4 }}>
            Welcome, {user?.name || 'Champ'}!
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper 
                onClick={() => router.push('/dashboard/events')}
                sx={{ 
                  p: 4, borderRadius: 4, borderBottom: '4px solid', borderColor: 'primary.main',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(37, 99, 235, 0.2)' }
                }}
              >
                <ChartBarIcon className="w-10 h-10 text-primary-main mb-2" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Event Management</Typography>
                <Typography variant="body2" color="text.secondary">Create and manage competitions.</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper 
                onClick={() => router.push('/dashboard/scoring')}
                sx={{ 
                  p: 4, borderRadius: 4, borderBottom: '4px solid', borderColor: 'secondary.main',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(249, 115, 22, 0.2)' }
                }}
              >
                <TrophyIcon className="w-10 h-10 text-secondary-main mb-2" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Scoring</Typography>
                <Typography variant="body2" color="text.secondary">Assign points to teams in real-time.</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper 
                onClick={() => router.push('/dashboard/standings')}
                sx={{ 
                  p: 4, borderRadius: 4, borderBottom: '4px solid', borderColor: 'success.main',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(34, 197, 94, 0.2)' }
                }}
              >
                <UsersIcon className="w-10 h-10 text-success-main mb-2" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Team Standings</Typography>
                <Typography variant="body2" color="text.secondary">View leaderboard and podium.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
