'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Stack, useTheme, Grid, Avatar,
  keyframes, LinearProgress
} from '@mui/material';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, Cell
} from 'recharts';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { 
  TrophyIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  MusicalNoteIcon,
  StarIcon,
  PaintBrushIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import { CATEGORIES, CATEGORY_COLORS, EVENT_CATEGORY_MAP } from '@/constants/CategoryMapping';

// --- Types ---
interface Team {
  _id: string;
  name: string;
  color: string;
  institution: string;
}

interface Score {
  team: { _id: string; name: string };
  event: { _id: string; name: string; category?: string };
  score: string;
}

interface Props {
  teams: Team[];
  allScores: Score[];
  events: any[];
}

// --- Styles & Animations ---
const TEAM_COLOR_MAP: Record<string, { main: string, grad: string[] }> = {
  white: { main: '#f8fafc', grad: ['#e2e8f0', '#94a3b8'] }, // Silver/Slate for visibility
  red: { main: '#ef4444', grad: ['#f87171', '#b91c1c'] },
  blue: { main: '#3b82f6', grad: ['#60a5fa', '#1d4ed8'] },
  green: { main: '#22c55e', grad: ['#4ade80', '#15803d'] },
};

const CATEGORY_ICONS: Record<string, any> = {
  "Fine Arts": PaintBrushIcon,
  "Dance": StarIcon,
  "Singing": MusicalNoteIcon,
  "Theatre": UserGroupIcon
};

const pulseGlow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.1)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)); }
  100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.1)); }
`;

const Counter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      onUpdate: (latest) => setCount(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);
  return <>{count.toLocaleString()}</>;
};

export default function StandingsDashboard({ teams, allScores, events }: Props) {
  const theme = useTheme();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [prevStandings, setPrevStandings] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState(0);
  const CYCLE_TIME = 8000; // 8 seconds

  const currentCategory = CATEGORIES[categoryIndex];

  // 1. Progress & Cycle Logic
  useEffect(() => {
    const interval = 50; // Update progress every 50ms
    const step = (interval / CYCLE_TIME) * 100;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCategoryIndex((idx) => (idx + 1) % CATEGORIES.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // 2. Global Standings
  const globalStandings = useMemo(() => {
    const stats = teams.map(team => {
      const total = allScores
        .filter(s => s.team?._id === team._id)
        .reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
      return { id: team._id, name: team.name, total, color: team.color };
    }).sort((a, b) => b.total - a.total);
    return stats;
  }, [teams, allScores]);

  useEffect(() => {
    if (globalStandings.length > 0) {
      const currentRanks: Record<string, number> = {};
      globalStandings.forEach((t, i) => currentRanks[t.id] = i);
      if (Object.keys(prevStandings).length === 0) {
        setPrevStandings(currentRanks);
      }
    }
  }, [globalStandings, prevStandings]);

  const leader = globalStandings[0];

  // 3. Category Data
  const categoryData = useMemo(() => {
    const eventsInCategory = events.filter(e => {
        const cat = e.category || EVENT_CATEGORY_MAP[e.name] || "General";
        return cat === currentCategory;
    });

    return eventsInCategory.map(evt => {
      const dataPoint: any = { eventName: evt.name };
      teams.forEach(team => {
        const scoreObj = allScores.find(s => s.team?._id === team._id && s.event?._id === evt._id);
        dataPoint[team.name] = parseFloat(scoreObj?.score || '0');
      });
      return dataPoint;
    }).slice(0, 7); 
  }, [events, allScores, currentCategory, teams]);

  const Icon = CATEGORY_ICONS[currentCategory] || StarIcon;

  return (
    <Box sx={{ width: '100%', minHeight: '90vh', position: 'relative' }}>
      {/* Background Decorative Mesh */}
      <Box sx={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
        background: `radial-gradient(circle at 10% 20%, ${theme.palette.primary.main}11 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, ${CATEGORY_COLORS[currentCategory]}11 0%, transparent 40%)`,
        pointerEvents: 'none'
      }} />

      {/* TOP PANEL */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ 
            p: 4, borderRadius: 8, overflow: 'hidden', position: 'relative',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #1e293b 100%)`,
            color: 'white', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)'
          }}>
            <Box sx={{ position: 'absolute', right: -30, top: -30, opacity: 0.1 }}>
              <TrophyIcon style={{ width: 220, height: 220 }} />
            </Box>
            
            <Stack direction="row" spacing={3} alignItems="center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }}>
                <Avatar sx={{ 
                  width: 90, height: 90, 
                  bgcolor: TEAM_COLOR_MAP[leader?.color]?.main || 'white', 
                  border: '5px solid rgba(255,255,255,0.1)',
                  boxShadow: `0 0 30px ${TEAM_COLOR_MAP[leader?.color]?.main}44`,
                  animation: `${pulseGlow} 3s infinite ease-in-out`
                }}>
                  <TrophyIcon style={{ width: 45, height: 45, color: leader?.color === 'white' ? '#1e293b' : 'white' }} />
                </Avatar>
              </motion.div>
              
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 3, color: 'primary.light' }}>CURRENT LEADER</Typography>
                <Typography variant="h2" sx={{ fontWeight: 950, textTransform: 'uppercase', letterSpacing: '-0.02em', mb: -0.5 }}>
                  {leader?.name?.split(' ')[0] || "---"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, opacity: 0.9 }}>
                  <Counter value={leader?.total || 0} /> <span style={{ fontSize: '1rem', fontWeight: 600 }}>CUMULATIVE POINTS</span>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ 
            p: 4, borderRadius: 8, height: '100%', bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)'
          }}>
            <Stack direction="row" spacing={2} sx={{ height: '100%' }} alignItems="center" justifyContent="space-around">
              {globalStandings.slice(0, 4).map((team, index) => {
                const prevRank = prevStandings[team.id] ?? index;
                const trend = prevRank - index; 
                return (
                  <Stack key={team.id} alignItems="center" spacing={1.5}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar 
                        sx={{ 
                          width: 68, height: 68, bgcolor: TEAM_COLOR_MAP[team.color].main, 
                          border: '4px solid ivory', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' 
                        }}
                      >
                         <Typography sx={{ fontWeight: 950, color: team.color === 'white' ? 'black' : 'white', fontSize: '1.2rem' }}>{index + 1}</Typography>
                      </Avatar>
                      {trend !== 0 && (
                        <Box sx={{ 
                          position: 'absolute', right: -6, top: -6, 
                          bgcolor: trend > 0 ? '#10b981' : '#ef4444', border: '2px solid white',
                          borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                          {trend > 0 ? <ChevronUpIcon style={{ width: 16, height: 16, color: 'white' }} /> : <ChevronDownIcon style={{ width: 16, height: 16, color: 'white' }} />}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{team.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>{team.total} PTS</Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* MAIN DATA MONITOR */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ 
            p: 5, borderRadius: 10, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden',
            border: '1px solid', borderColor: 'divider', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.08)'
          }}>
            {/* Cycle Progress Bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': { bgcolor: CATEGORY_COLORS[currentCategory], transition: 'none' }
                }} 
              />
            </Box>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6, pt: 1 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ 
                  p: 2.5, bgcolor: CATEGORY_COLORS[currentCategory], borderRadius: 6, color: 'white',
                  boxShadow: `0 20px 40px ${CATEGORY_COLORS[currentCategory]}44`
                }}>
                  <Icon style={{ width: 44, height: 44 }} />
                </Box>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em', lineHeight: 1 }}>{currentCategory}</Typography>
                  <Typography variant="h6" sx={{ opacity: 0.6, fontWeight: 700, mt: 1 }}>Competition Dynamics • Round Analytics</Typography>
                </Box>
              </Stack>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: CATEGORY_COLORS[currentCategory] }}>SECTION {categoryIndex + 1}/{CATEGORIES.length}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>AUTO-CYCLING ACTIVE</Typography>
              </Box>
            </Stack>

            {/* BAR CHART */}
            <Box sx={{ height: 500, width: '100%', mt: 2 }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 150, right: 60 }} barSize={12} barGap={10}>
                    <defs>
                      {teams.map(team => (
                        <linearGradient key={`grad-${team._id}`} id={`grad-${team._id}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={TEAM_COLOR_MAP[team.color].grad[0]} />
                          <stop offset="100%" stopColor={TEAM_COLOR_MAP[team.color].grad[1]} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" hide domain={[0, 10]} />
                    <YAxis 
                      dataKey="eventName" type="category" 
                      tick={{ fontWeight: 900, fill: theme.palette.text.primary, fontSize: 16 }}
                      axisLine={false} tickLine={false} width={150}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ borderRadius: 24, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: 20 }}
                    />
                    {teams.map((team) => (
                      <Bar 
                        key={team._id} dataKey={team.name} 
                        fill={`url(#grad-${team._id})`} 
                        radius={[0, 20, 20, 0]}
                        animationDuration={1500}
                        style={{ filter: team.name === 'White' || team.color === 'white' ? 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' : 'none' }}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', opacity: 0.4 }}>
                  <BoltIcon style={{ width: 80, height: 80, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Wait for Data Refresh</Typography>
                  <Typography variant="body1">System is monitoring {currentCategory} for scores...</Typography>
                </Stack>
              )}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, fontWeight: 800, opacity: 0.3, letterSpacing: 5 }}>
        SPONTANIA LIVE DATA PLATFORM • 2026
      </Typography>
    </Box>
  );
}
