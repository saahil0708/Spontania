import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinnerCelebrationProps {
    winner: {
        team: { name: string; color: string; institution: string };
        rank: number;
        type: string;
        event?: { name: string };
    };
    onComplete: () => void;
}

const TEAM_COLOR_VALUES: Record<string, string> = {
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e'
};

const FINAL_RANK_THEMES: Record<number, { main: string; grad: string[]; iconLabel: string }> = {
    1: { main: '#fbbf24', grad: ['#fbbf24', '#b45309'], iconLabel: 'GRAND CHAMPION' }, // Gold
    2: { main: '#cbd5e1', grad: ['#cbd5e1', '#64748b'], iconLabel: '1ST RUNNER UP' },   // Silver (Lighter)
    3: { main: '#f59e0b', grad: ['#f59e0b', '#92400e'], iconLabel: '2ND RUNNER UP' },   // Bronze (Vibrant)
};

export default function WinnerCelebration({ winner, onComplete }: WinnerCelebrationProps) {
    const theme = useTheme();
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const isFinal = winner.type === 'Final';
        // Trigger confetti
        const duration = (isFinal ? 10 : 5) * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { 
            startVelocity: isFinal ? 45 : 30, 
            spread: 360, 
            ticks: isFinal ? 100 : 60, 
            zIndex: 9999,
            scalar: isFinal ? 1.5 : 1
        };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = (isFinal ? 80 : 50) * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            
            if (isFinal && Math.random() > 0.7) {
                confetti({
                    ...defaults,
                    particleCount: 20,
                    origin: { x: 0.5, y: 0.5 },
                    colors: ['#fbbf24', '#f59e0b', '#d97706']
                });
            }
        }, 250);

        // Auto close after display duration
        const timer = setTimeout(() => {
            onComplete();
        }, isFinal ? 12000 : 8000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onComplete, winner.type]);

    const isFinal = winner.type === 'Final';
    const rankTheme = isFinal ? FINAL_RANK_THEMES[winner.rank] : null;
    const teamColor = rankTheme?.main || TEAM_COLOR_VALUES[winner.team.color] || winner.team.color;

    return (
        <AnimatePresence>
            <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,1) 100%)`,
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                }}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Typography variant="h6" sx={{ 
                        textTransform: 'uppercase', 
                        letterSpacing: isFinal ? 12 : 8, 
                        fontWeight: 950, 
                        color: teamColor,
                        mb: isFinal ? 6 : 2,
                        textAlign: 'center',
                        textShadow: isFinal ? `0 0 20px ${teamColor}66` : 'none'
                    }}>
                        {isFinal ? rankTheme?.iconLabel : `${winner.event?.name || 'ROUND'} WINNER`}
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ scale: 0, rotate: isFinal ? -10 : -20 }}
                    animate={{ scale: isFinal ? 1.2 : 1, rotate: 0 }}
                    transition={{ 
                        type: "spring",
                        stiffness: isFinal ? 200 : 260,
                        damping: isFinal ? 15 : 20,
                        delay: 0.8
                    }}
                >
                    <Paper sx={{ 
                        p: isFinal ? 8 : 6, 
                        borderRadius: 2, 
                        border: `4px solid ${teamColor}`,
                        boxShadow: `0 0 100px ${teamColor}88`,
                        background: isFinal 
                            ? `linear-gradient(135deg, #1e293b 0%, ${teamColor}22 50%, #0f172a 100%)`
                            : `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
                        mb: 6,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {isFinal && (
                            <Box sx={{ 
                                position: 'absolute', top: -20, right: -20, fontSize: '10rem', 
                                opacity: 0.1, color: 'white', transform: 'rotate(20deg)', pointerEvents: 'none' 
                            }}>
                                🏆
                            </Box>
                        )}
                        <Typography variant={isFinal ? "h1" : "h1"} sx={{ 
                            fontWeight: 950, 
                            color: 'white',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            mb: 2,
                            fontSize: isFinal ? '6rem' : '4rem',
                            letterSpacing: -1
                        }}>
                            {winner.team.name}
                        </Typography>
                        <Typography variant={isFinal ? "h3" : "h4"} sx={{ 
                            fontWeight: 700, 
                            opacity: 0.9,
                            color: teamColor,
                            letterSpacing: 2
                        }}>
                            {winner.team.institution}
                        </Typography>
                    </Paper>
                </motion.div>

                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <Typography variant="h4" sx={{ 
                        fontWeight: 900, 
                        letterSpacing: 4, 
                        color: isFinal ? 'white' : 'inherit',
                        opacity: isFinal ? 1 : 0.8 
                    }}>
                        {isFinal ? `OVERALL RANK #${winner.rank}` : `RANK #${winner.rank}`}
                    </Typography>
                </motion.div>

                <Box sx={{ mt: 8, textAlign: 'center' }}>
                     <Typography sx={{ fontSize: '0.8rem', opacity: 0.4, letterSpacing: 4 }}>
                         CONGRATULATIONS FROM SPONTANIA 2026
                     </Typography>
                </Box>
            </Box>
        </AnimatePresence>
    );
}
