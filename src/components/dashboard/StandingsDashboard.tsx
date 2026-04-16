'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Stack, useTheme, Grid, Avatar,
  keyframes, LinearProgress
} from '@mui/material';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, Cell, LabelList
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

const Counter = ({ value, fontSize = 10 }: { value: number, fontSize?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      onUpdate: (latest) => setCount(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);
  return <tspan style={{ fontSize, fontWeight: 700 }}>{count}</tspan>;
};

const CountingLabel = (props: any) => {
  const { x, y, width, value, theme } = props;
  if (value === 0) return null;
  return (
    <text 
      x={x + width / 2} 
      y={y - 10} 
      textAnchor="middle"
      fill={theme.palette.text.primary} 
      style={{ fontWeight: 900 }}
    >
      <Counter value={value} fontSize={14} />
    </text>
  );
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
    let currentProgress = 0;
    
    const timer = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= 100) {
        currentProgress = 0;
        setCategoryIndex((idx) => (idx + 1) % CATEGORIES.length);
      }
      setProgress(currentProgress);
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
    // Expected events for this category
    const expectedEventNames = Object.keys(EVENT_CATEGORY_MAP).filter(
      key => EVENT_CATEGORY_MAP[key].trim().toLowerCase() === currentCategory?.trim().toLowerCase()
    );

    const dbEventsInCategory = events.filter(e => {
        const eventName = e.name?.trim();
        const cat = e.category || EVENT_CATEGORY_MAP[eventName] || "General";
        return cat.trim().toLowerCase() === currentCategory?.trim().toLowerCase();
    });

    const mergedEvents = expectedEventNames.map(name => {
         const found = dbEventsInCategory.find(e => e.name?.trim() === name);
         return found || { _id: `dummy-${name}`, name };
    });

    dbEventsInCategory.forEach(e => {
         if (!expectedEventNames.includes(e.name?.trim())) {
              mergedEvents.push(e);
         }
    });

    return mergedEvents.map(evt => {
      const dataPoint: any = { eventName: evt.name };
      teams.forEach(team => {
        const scoreObj = allScores.find(s => s.team?._id === team._id && (s.event?._id === evt._id || s.event?.name === evt.name));
        dataPoint[team.name] = parseFloat(scoreObj?.score || '0');
      });
      return dataPoint;
    }).slice(0, 7); 
  }, [events, allScores, currentCategory, teams]);

  const maxScore = useMemo(() => {
    let max = 0;
    categoryData.forEach(entry => {
      teams.forEach(team => {
        const val = entry[team.name];
        if (typeof val === 'number' && val > max) {
          max = val;
        }
      });
    });
    return max;
  }, [categoryData, teams]);

  const Icon = CATEGORY_ICONS[currentCategory] || StarIcon;

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes flickerHighest {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(255,255,255,0.3)) !important; }
          50% { filter: brightness(1.5) drop-shadow(0 0 20px rgba(255,255,255,0.8)) !important; }
        }
        @keyframes pulseLive {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .highest-bar {
          animation: flickerHighest 0.8s infinite alternate ease-in-out;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          animation: pulseLive 1.5s infinite ease-in-out;
          box-shadow: 0 0 10px #ef4444;
        }
      `}</style>
      {/* Background Decorative Mesh */}
      <Box sx={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
        background: `radial-gradient(circle at 10% 20%, ${theme.palette.primary.main}11 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, ${CATEGORY_COLORS[currentCategory]}11 0%, transparent 40%)`,
        pointerEvents: 'none'
      }} />

      {/* MAIN DATA MONITOR */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <Paper sx={{ 
            p: 2, borderRadius: 10, bgcolor: 'transparent', position: 'relative', overflow: 'hidden',
            boxShadow: 'none'
          }}>
            {/* Cycle Progress Bar */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 6, bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: CATEGORY_COLORS[currentCategory], 
                    transition: 'transform 0.05s linear'
                  }
                }} 
              />
            </Box>

            {/* Header */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, pt: 0.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{ 
                  p: 1.2, bgcolor: CATEGORY_COLORS[currentCategory], borderRadius: 3, color: 'white',
                  boxShadow: `0 8px 16px ${CATEGORY_COLORS[currentCategory]}33`
                }}>
                  <Icon style={{ width: 24, height: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.02em', lineHeight: 1 }}>{currentCategory}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: 'block' }}>Competition Dynamics • Round Analytics</Typography>
                </Box>
              </Stack>
              
              <Box sx={{ textAlign: 'right' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.2, justifyContent: 'flex-end' }}>
                  <Box className="live-dot" />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main', letterSpacing: 1.2, fontSize: '0.65rem' }}>LIVE BROADCAST</Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 900, color: CATEGORY_COLORS[currentCategory], lineHeight: 1 }}>SECTION {categoryIndex + 1}/{CATEGORIES.length}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5, display: 'block', fontSize: '0.7rem' }}>AUTO-CYCLING ACTIVE</Typography>
              </Box>
            </Stack>

            {/* BAR CHART */}
            <Box sx={{ height: 'calc(100vh - 250px)', width: '100%', mt: 0 }}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={categoryData} 
                    layout="horizontal" 
                    margin={{ left: 50, right: 30, top: 30, bottom: 80 }} 
                    barSize={24} 
                    barGap={6}
                    barCategoryGap="20%"
                  >
                    <defs>
                      {teams.map(team => (
                        <linearGradient key={`grad-${team._id}`} id={`grad-${team._id}`} x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor={TEAM_COLOR_MAP[team.color].grad[1]} />
                          <stop offset="100%" stopColor={TEAM_COLOR_MAP[team.color].grad[0]} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={theme.palette.divider} opacity={0.3} />
                    <XAxis 
                      dataKey="eventName" 
                      type="category" 
                      tick={{ fontWeight: 800, fill: theme.palette.text.primary, fontSize: 13 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={80}
                      axisLine={{ stroke: theme.palette.divider, opacity: 0.5 }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="number" 
                      domain={[0, 40]} 
                      ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
                      tick={{ fontWeight: 900, fill: theme.palette.text.secondary, fontSize: 13 }}
                      axisLine={false} 
                      tickLine={false} 
                      width={50}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      contentStyle={{ 
                        borderRadius: 16, border: '1px solid rgba(255,255,255,0.4)', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: 16, 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)'
                      }}
                      itemStyle={{ fontWeight: 800, fontSize: 13, padding: '4px 0' }}
                      labelStyle={{ fontWeight: 900, fontSize: 12, opacity: 0.5, marginBottom: 8, textTransform: 'uppercase' }}
                    />
                    {teams.map((team) => (
                      <Bar 
                        key={team._id} dataKey={team.name} 
                        radius={[10, 10, 0, 0]}
                        animationDuration={1500}
                      >
                        {categoryData.map((entry: any, index: number) => {
                          const isHighest = entry[team.name] === maxScore && maxScore > 0;
                          return (
                            <Cell 
                              key={`cell-${index}`}
                              fill={`url(#grad-${team._id})`}
                              className={isHighest ? 'highest-bar' : ''}
                              style={{ 
                                filter: team.name === 'White' || team.color === 'white' ? 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' : 'none'
                              }}
                            />
                          );
                        })}
                        <LabelList 
                          dataKey={team.name} 
                          content={<CountingLabel theme={theme} />}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
                  <BoltIcon style={{ width: 80, height: 80, marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Wait for Data Refresh</Typography>
                  <Typography variant="body1">System is monitoring {currentCategory} for scores...</Typography>
                </Stack>
              )}
            </Box>
          </Paper>
        </motion.div>
      </AnimatePresence>

      <Box sx={{ mt: 'auto', pb: 2, zIndex: 10 }}>
        <Typography 
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            fontWeight: 900, 
            letterSpacing: 4, 
            color: '#1e293b',
            fontSize: '0.85rem',
            textTransform: 'uppercase'
          }}
        >
          SPONTANIA LIVE DATA PLATFORM • 2026
        </Typography>
      </Box>
    </Box>
  );
}
