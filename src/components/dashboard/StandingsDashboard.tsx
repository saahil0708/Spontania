'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, useTheme, Grid, Avatar,
  keyframes, LinearProgress
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, Cell, LabelList, AreaChart, Area
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
import WinnerCelebration from './WinnerCelebration';
import { useAnnounceWinnerMutation } from '@/redux/features/winnersApi';

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
  winners?: any[];
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

const TEAM_LOGOS: Record<string, string> = {
  white: '/assets/wn.png',
  red: '/assets/rr.png',
  blue: '/assets/bv.png',
  green: '/assets/gg.png',
};

const pulseGlow = keyframes`
  0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.1)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)); }
  100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.1)); }
`;

const BackgroundCurves = () => {
  const colors = {
    red: '#ff5252',
    skyBlue: '#00a8ff',
    orange: '#ff9f43',
    green: '#1dd1a1'
  };

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
      overflow: 'hidden', pointerEvents: 'none',
      background: '#f8fafc'
    }}>
      {/* High-Visibility Aurora Mesh */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
        filter: 'blur(80px)', // Slightly reduced blur for more "solid" color
        opacity: 0.9, // Significantly boosted opacity
        zIndex: 0
      }}>
        <svg width="100%" height="100%">
          {/* Animated Liquid Blobs - Bold Saturation */}
          <motion.circle
            cx="10%" cy="10%" r="500" fill={colors.red}
            animate={{ cx: ["10%", "30%", "10%"], cy: ["10%", "0%", "10%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.6 }}
          />
          <motion.circle
            cx="90%" cy="15%" r="600" fill={colors.skyBlue}
            animate={{ cx: ["90%", "70%", "90%"], cy: ["15%", "35%", "15%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.5 }}
          />
          <motion.circle
            cx="15%" cy="90%" r="550" fill={colors.orange}
            animate={{ cx: ["15%", "35%", "15%"], cy: ["90%", "75%", "90%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.5 }}
          />
          <motion.circle
            cx="85%" cy="85%" r="500" fill={colors.green}
            animate={{ cx: ["85%", "65%", "85%"], cy: ["85%", "95%", "85%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.6 }}
          />

          {/* Large Flowing Waves */}
          <motion.path
            d="M 0 1000 C 300 800 600 1200 1000 1000 V 400 H 0 Z"
            fill={colors.red}
            animate={{ d: ["M 0 1000 C 300 800 600 1200 1000 1000 V 400 H 0 Z", "M 0 1000 C 400 1100 700 900 1000 1000 V 300 H 0 Z", "M 0 1000 C 300 800 600 1200 1000 1000 V 400 H 0 Z"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.3 }}
          />
        </svg>
      </Box>

      {/* Surface Depth Layer (Subtle Glassmorphism) */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'saturate(150%) brightness(1.1)', // Enhances the colors from behind
        zIndex: 1
      }} />

      {/* Subtle Texture Layer */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3F%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        zIndex: 2
      }} />
    </Box>
  );
};

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
  const { x, y, width, value, theme, teamKey } = props;
  if (value === 0) return null;
  const logo = TEAM_LOGOS[teamKey] || '';

  return (
    <g>
      {logo && (
        <image
          xlinkHref={logo}
          x={x + width / 2 - 15}
          y={y - 60}
          width={30}
          height={30}
          style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }}
        />
      )}
      <text
        x={x + width / 2}
        y={y - 12}
        textAnchor="middle"
        fill={theme.palette.text.primary}
        style={{ fontWeight: 900 }}
      >
        <Counter value={value} fontSize={15} />
      </text>
    </g>
  );
};

export default function StandingsDashboard({ teams, allScores, events, winners }: Props) {
  const theme = useTheme();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [prevStandings, setPrevStandings] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState(0);
  const [activeCelebration, setActiveCelebration] = useState<any>(null);
  const [announceWinner] = useAnnounceWinnerMutation();
  const CATEGORY_LIST = useMemo(() => CATEGORIES, []); // Removed CHAMPIONSHIP STANDINGS from regular cycle
  const [showSummaryOverride, setShowSummaryOverride] = useState(false);
  const [lastWinnerInfo, setLastWinnerInfo] = useState<{ teamName: string; points: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningWinnerId, setTransitioningWinnerId] = useState<string | null>(null);
  const currentCategory = showSummaryOverride ? "CHAMPIONSHIP STANDINGS" : CATEGORY_LIST[categoryIndex];
  const CYCLE_TIME = 8000;
  const SUMMARY_DISPLAY_TIME = 15000; // 15 seconds for the final summary

  // Logic to detect new winners
  useEffect(() => {
    if (winners && winners.length > 0) {
      const pendingWinner = winners.find(w => !w.isAnnounced);
      
      // Safety check: Don't start a transition if one is already in progress for this winner
      // or if this winner is already being celebrated.
      if (pendingWinner && 
          pendingWinner._id !== transitioningWinnerId && 
          (!activeCelebration || activeCelebration._id !== pendingWinner._id)) {
        
        setTransitioningWinnerId(pendingWinner._id);
        setIsTransitioning(true);
        
        setTimeout(() => {
          setActiveCelebration(pendingWinner);
          setIsTransitioning(false);
          setTransitioningWinnerId(null);
          
          // If it's a final winner, mark as announced immediately so the celebration can be permanent
          if (pendingWinner.type === 'Final') {
            announceWinner(pendingWinner._id);
          }
        }, 1200); // 1.2s black transition
      }
    }
  }, [winners, activeCelebration, announceWinner, transitioningWinnerId]);

  const handleCelebrationComplete = async () => {
    if (activeCelebration) {
      const winnerId = activeCelebration._id;
      const teamName = activeCelebration.team.name;
      const rank = activeCelebration.rank;
      
      // Approximate points gained based on rank (1st: 10, 2nd: 7, 3rd: 5)
      const points = rank === 1 ? 10 : rank === 2 ? 7 : 5;
      
      setLastWinnerInfo({ teamName, points });
      await announceWinner(winnerId);
      setActiveCelebration(null);
      
      // Trigger the summary override
      setShowSummaryOverride(true);
      setProgress(0);

      // Only return to normal cycle if it's NOT a final winner
      if (activeCelebration.type !== 'Final') {
        setTimeout(() => {
          setShowSummaryOverride(false);
          setLastWinnerInfo(null);
        }, 15000); // 15 seconds for round summary
      }
    }
  };

  // 1. Progress & Cycle Logic
  useEffect(() => {
    if (activeCelebration || showSummaryOverride) return; // Pause cycle during celebration or summary override

    const interval = 50;
    const step = (interval / CYCLE_TIME) * 100;
    let currentProgress = progress;

    const timer = setInterval(() => {
      currentProgress += step;
      if (currentProgress >= 100) {
        currentProgress = 0;
        setCategoryIndex((idx) => (idx + 1) % CATEGORY_LIST.length);
      }
      setProgress(currentProgress);
    }, interval);

    return () => clearInterval(timer);
  }, [activeCelebration, showSummaryOverride, progress]);

  // 2. Identify Visible Events (Dynamic Timeline)
  const visibleEventIds = useMemo(() => {
    // Baseline is always visible
    const ids = new Set(events.filter(e => e.name === "Tournament Baseline").map(e => e._id));
    
    // Any event that has an announced winner is visible
    winners?.forEach(w => {
      if (w.type === 'Round' && w.event?._id) {
        ids.add(w.event._id);
      }
    });

    // The event currently being celebrated is also visible
    if (activeCelebration?.type === 'Round' && activeCelebration.event?._id) {
      ids.add(activeCelebration.event._id);
    }

    return ids;
  }, [winners, activeCelebration, events]);

  const filteredScores = useMemo(() => {
    return allScores.filter(s => s.event?._id && visibleEventIds.has(s.event._id));
  }, [allScores, visibleEventIds]);

  // 3. Global Standings
  const globalStandings = useMemo(() => {
    const stats = teams.map(team => {
      const total = filteredScores
        .filter(s => s.team?._id === team._id)
        .reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
      return { id: team._id, name: team.name, total, color: team.color };
    }).sort((a, b) => b.total - a.total);
    return stats;
  }, [teams, filteredScores]);

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
  const second = globalStandings[1];
  const leaderMargin = leader && second ? leader.total - second.total : 0;

  // 4. Points Progression Data (Variation over rounds)
  const progressionData = useMemo(() => {
    if (!filteredScores || filteredScores.length === 0) return [];
    
    // Get unique events in order
    const scoredEventIds = Array.from(new Set(filteredScores.map(s => s.event?._id).filter(Boolean)));
    const displayedEvents = events
      .filter(e => scoredEventIds.includes(e._id))
      .sort((a, b) => {
        // Tournament Baseline ALWAYS comes first
        if (a.name === "Tournament Baseline") return -1;
        if (b.name === "Tournament Baseline") return 1;
        return (a.createdAt || a.name).localeCompare(b.createdAt || b.name);
      });

    const runningTotals: Record<string, number> = {};
    teams.forEach(t => runningTotals[t._id] = 0);

    const history = displayedEvents.map(evt => {
      const dataPoint: any = { eventName: evt.name };
      teams.forEach(team => {
        const scoreObj = filteredScores.find(s => s.team?._id === team._id && s.event?._id === evt._id);
        const scoreVal = parseFloat(scoreObj?.score || '0');
        runningTotals[team._id] += scoreVal;
        dataPoint[team.name] = runningTotals[team._id];
      });
      return dataPoint;
    });

    // Add a baseline 0 point at the start if not already there
    if (history.length > 0 && history[0].eventName !== 'Start') {
        const baseline: any = { eventName: 'Start' };
        teams.forEach(t => baseline[t.name] = 0);
        return [baseline, ...history];
    }
    
    return history;
  }, [filteredScores, teams, events]);

  // 5. Category Data
  const categoryData = useMemo(() => {
    // Expected events for this category
    const expectedEventNames = Object.keys(EVENT_CATEGORY_MAP).filter(
      key => EVENT_CATEGORY_MAP[key].trim().toLowerCase() === currentCategory?.trim().toLowerCase()
    );

    const dbEventsInCategory = events.filter(e => {
      if (e.name === "Tournament Baseline") return false; 
      const eventName = e.name?.trim();
      const cat = e.category || EVENT_CATEGORY_MAP[eventName] || "General";
      return cat.trim().toLowerCase() === currentCategory?.trim().toLowerCase();
    });

    const mergedEvents = expectedEventNames.map(name => {
      const found = dbEventsInCategory.find(e => e.name?.trim() === name);
      return found || null;
    }).filter(Boolean);

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

  // 6. Category-Specific Leader Board
  const categoryStandings = useMemo(() => {
    return teams.map(team => {
      const total = allScores
        .filter(s => {
          if (s.event?.name === "Tournament Baseline") return false; // Exclude baseline from category scores
          const eventName = s.event?.name;
          const cat = s.event?.category || EVENT_CATEGORY_MAP[eventName] || "General";
          return s.team?._id === team._id && cat.trim().toLowerCase() === currentCategory?.trim().toLowerCase();
        })
        .reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
      return { ...team, total };
    }).sort((a, b) => b.total - a.total);
  }, [teams, allScores, currentCategory]);

  const categoryWinners = useMemo(() => {
    const topScore = categoryStandings[0]?.total;
    if (!topScore || topScore === 0) return [];
    return categoryStandings.filter(t => t.total === topScore);
  }, [categoryStandings]);

  const isTie = categoryWinners.length > 1;
  const categoryLeader = categoryWinners[0];

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
      {/* Premium Smooth Curve Background */}
      <BackgroundCurves />

      <AnimatePresence>
        {isTransitioning && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              bgcolor: 'black', zIndex: 10000, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, letterSpacing: 10, opacity: 0.2 }}>
              SPONTANIA
            </Typography>
          </Box>
        )}
        {activeCelebration && (
          <WinnerCelebration
            winner={activeCelebration}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

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
                    bgcolor: currentCategory === "CHAMPIONSHIP STANDINGS" ? theme.palette.primary.main : CATEGORY_COLORS[currentCategory],
                    transition: 'transform 0.05s linear'
                  }
                }}
              />
            </Box>

            {/* Header */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, pt: 0.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box sx={{
                  p: 1.2, bgcolor: currentCategory === "CHAMPIONSHIP STANDINGS" ? theme.palette.primary.main : CATEGORY_COLORS[currentCategory], borderRadius: 3, color: 'white',
                  boxShadow: `0 8px 16px ${currentCategory === "CHAMPIONSHIP STANDINGS" ? theme.palette.primary.main : CATEGORY_COLORS[currentCategory]}33`
                }}>
                  <Icon style={{ width: 24, height: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.02em', lineHeight: 1 }}>{currentCategory}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: 'block' }}>Competition Dynamics • Round Analytics</Typography>
                </Box>
              </Stack>

              {/* Category Leader Badge - Small Space */}
              {categoryWinners.length > 0 && currentCategory !== "CHAMPIONSHIP STANDINGS" && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 0.8,
                    px: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, display: 'block', lineHeight: 1, fontSize: '0.6rem' }}>
                      {isTie ? 'Tie Leaders' : 'Overall Leader'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 950, color: '#1e293b', lineHeight: 1 }}>
                      {isTie ? 'MULTIPLE' : categoryLeader.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: -1, alignItems: 'center', position: 'relative' }}>
                    {categoryWinners.map((winner, idx) => (
                      <Box
                        key={winner._id}
                        sx={{
                          width: 34, height: 34, borderRadius: '50%', bgcolor: 'white', p: 0.4,
                          border: '2px solid', borderColor: TEAM_COLOR_MAP[winner.color]?.main || 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          marginLeft: idx > 0 ? -1.5 : 0,
                          zIndex: categoryWinners.length - idx,
                          position: 'relative',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', zIndex: 10 }
                        }}
                      >
                        <img src={TEAM_LOGOS[winner.color]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </Box>
                    ))}
                    <Box sx={{
                      position: 'absolute', bottom: -4, right: -4, bgcolor: 'primary.main',
                      color: 'white', px: 0.6, py: 0.1, borderRadius: 1, fontSize: '0.65rem', fontWeight: 900,
                      zIndex: 20
                    }}>
                      {categoryWinners[0].total}
                    </Box>
                  </Box>
                </Paper>
              )}

              <Box sx={{ textAlign: 'right' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.2, justifyContent: 'flex-end', mr: 0.7 }}>
                  <Box className="live-dot" />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main', letterSpacing: 1.2, fontSize: '0.65rem' }}>LIVE BROADCAST</Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 900, color: currentCategory === "CHAMPIONSHIP STANDINGS" ? "primary.main" : CATEGORY_COLORS[currentCategory], lineHeight: 1 }}>
                  {currentCategory === "CHAMPIONSHIP STANDINGS" ? "FINAL SUMMARY" : `SECTION ${categoryIndex + 1}/${CATEGORIES.length}`}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5, display: 'block', fontSize: '0.7rem' }}>
                  {showSummaryOverride ? "EVENT UPDATE DISPLAY" : "AUTO-CYCLING ACTIVE"}
                </Typography>
              </Box>
            </Stack>

            {/* Summary Information Cards (Only shown during override) */}
            <AnimatePresence>
              {showSummaryOverride && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Grid container spacing={2}>
                    {lastWinnerInfo && (
                      <Grid size={6}>
                        <Paper elevation={0} sx={{ 
                          p: 2, bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', 
                          borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)',
                          display: 'flex', alignItems: 'center', gap: 2
                        }}>
                          <Box sx={{ 
                            p: 1.5, bgcolor: 'success.main', borderRadius: '50%', color: 'white',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                          }}>
                            <ChevronUpIcon style={{ width: 24, height: 24 }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>RECENT GAIN</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 950, color: '#1e293b' }}>
                              {lastWinnerInfo.teamName}: <span style={{ color: '#22c55e' }}>+{lastWinnerInfo.points} PTS</span>
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                    <Grid size={lastWinnerInfo ? 6 : 12}>
                      <Paper elevation={0} sx={{ 
                        p: 2, bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', 
                        borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', gap: 2
                      }}>
                        <Box sx={{ 
                          p: 1.5, bgcolor: 'primary.main', borderRadius: '50%', color: 'white',
                          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                        }}>
                          <TrophyIcon style={{ width: 24, height: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>LEADERSHIP STATUS</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 950, color: '#1e293b' }}>
                            {leader?.name} is leading by <span style={{ color: theme.palette.primary.main }}>{leaderMargin} PTS</span>
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BAR CHART */}
            <Box sx={{ height: showSummaryOverride ? 'calc(100vh - 280px)' : 'calc(100vh - 250px)', width: '100%', mt: 0, transition: 'height 0.5s ease' }}>
              {currentCategory === "CHAMPIONSHIP STANDINGS" ? (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: '65%', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={globalStandings} margin={{ left: 50, right: 30, top: 40, bottom: 20 }}>
                        <defs>
                          {teams.map(team => (
                            <linearGradient key={`grad-global-${team._id}`} id={`grad-global-${team._id}`} x1="0" y1="1" x2="0" y2="0">
                              <stop offset="0%" stopColor={TEAM_COLOR_MAP[team.color].grad[1]} />
                              <stop offset="100%" stopColor={TEAM_COLOR_MAP[team.color].grad[0]} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontWeight: 900, fontSize: 14 }} />
                        <YAxis domain={[0, 300]} ticks={[0, 50, 100, 150, 200, 250, 300]} tick={{ fontWeight: 800 }} />
                        <RechartsTooltip contentStyle={{ borderRadius: 12, fontWeight: 800 }} />
                        <Bar dataKey="total" radius={[15, 15, 0, 0]} animationDuration={2000}>
                          {globalStandings.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#grad-global-${entry.id})`} />
                          ))}
                          <LabelList dataKey="total" content={<CountingLabel theme={theme} teamKey="color" />} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {progressionData.length > 1 && (
                    <Box sx={{ height: '35%', width: '100%', mt: 1, background: 'rgba(255,255,255,0.3)', borderRadius: 4, pt: 2, pb: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressionData} margin={{ left: 50, right: 30, top: 10, bottom: 0 }}>
                          <defs>
                            {teams.map(team => (
                              <linearGradient key={`prog-grad-${team._id}`} id={`prog-grad-${team._id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={TEAM_COLOR_MAP[team.color].main} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={TEAM_COLOR_MAP[team.color].main} stopOpacity={0}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <XAxis dataKey="eventName" hide />
                          <YAxis domain={[0, 300]} hide />
                          <RechartsTooltip />
                          {teams.map(team => (
                            <Area
                              key={`area-${team._id}`}
                              type="monotone"
                              dataKey={team.name}
                              stroke={TEAM_COLOR_MAP[team.color].main}
                              fillOpacity={1}
                              fill={`url(#prog-grad-${team._id})`}
                              strokeWidth={3}
                              animationDuration={3000}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
              ) : categoryData.length > 0 ? (
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
                      tick={{ fill: theme.palette.text.secondary, fontWeight: 800, fontSize: 13 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 40]}
                      ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
                      width={40}
                      padding={{ top: 60 }}
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
                          content={<CountingLabel theme={theme} teamKey={team.color} />}
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
