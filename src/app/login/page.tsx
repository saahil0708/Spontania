'use client';

import { useState } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  TextField, 
  Typography, 
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Stack
} from '@mui/material';
import { 
  LockClosedIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '@/redux/api/authApi';
import { setCredentials } from '@/redux/features/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ 
        user: result.data
      }));
      toast.success('Login Successful! Welcome back.', {
        duration: 4000,
        position: 'top-right',
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.data?.message || 'Login failed. Please check your credentials.');
      toast.error('Login Failed. Please try again.');
    }
  };

  return (
    <Grid container sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 30%, #fff7ed 70%, #f8fafc 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Sporty Background Element (Diagonal Stripe) */}
      <Box sx={{ 
        position: 'absolute', 
        top: -100, 
        left: -100, 
        width: 400, 
        height: 1000, 
        bgcolor: 'primary.main', 
        opacity: 0.03, 
        transform: 'rotate(25deg)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Left Column: Form */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: { xs: 4, md: 8, lg: 12 }, 
        zIndex: 1
      }}>
        <Fade in timeout={800}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, height: 80 }}>
              <img src="/assets/spontania_logo.png" alt="Spontania Logo" style={{ height: '100%', objectFit: 'contain' }} />
            </Box>

            <Typography variant="h2" gutterBottom sx={{ mb: 1, textTransform: 'uppercase' }}>
              Admin Portal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontWeight: 500 }}>
              Unlock the arena. Manage results with precision.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 4, border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  id="email"
                  label="EMAIL ADDRESS"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <TextField
                  fullWidth
                  name="password"
                  label="PASSWORD"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockClosedIcon className="w-5 h-5 text-slate-400" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
                }}
              >
                {isLoading ? <CircularProgress size={28} color="inherit" /> : 'SECURE SIGN IN'}
              </Button>

              <Box sx={{ mt: 5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                  Authorized Personnel Only • Spontania © 2026
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Grid>

      {/* Right Column: Sporty Graphic */}
      <Grid size={{ md: 7, lg: 8 }} 
        sx={{ 
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'url(/assets/sporty_login_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
            zIndex: 1
          }
        }}
      >
        <Fade in timeout={1200}>
          <Box sx={{ textAlign: 'center', zIndex: 2, p: 4, color: 'white' }}>
            <Typography variant="h1" sx={{ 
              color: 'white', 
              fontSize: { md: '4rem', lg: '6rem' },
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              mb: 2,
              WebkitTextStroke: '1px rgba(255,255,255,0.3)',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              PERFORMANCE<br />FIRST
            </Typography>
            <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4 }}>
              Unlock the Next Level
            </Typography>
            
            <Box sx={{ mt: 6, height: 4, width: 80, bgcolor: 'secondary.main', mx: 'auto', borderRadius: 2 }} />
          </Box>
        </Fade>
      </Grid>
    </Grid>
  );
}
