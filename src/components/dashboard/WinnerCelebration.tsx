import React, { useEffect } from 'react';
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

const TEAM_LOGOS: Record<string, string> = {
    white: '/assets/wn.png',
    red: '/assets/rr.png',
    blue: '/assets/bv.png',
    green: '/assets/gg.png',
};

export default function WinnerCelebration({ winner, onComplete }: WinnerCelebrationProps) {
    const isFinal = winner.type === 'Final';
    const rankTheme = isFinal ? FINAL_RANK_THEMES[winner.rank] : null;
    const teamColor = rankTheme?.main || TEAM_COLOR_VALUES[winner.team.color] || winner.team.color;
    const teamLogo = TEAM_LOGOS[winner.team.color] || '';

    useEffect(() => {
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

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (!isFinal && timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = isFinal ? 60 : (50 * (timeLeft / duration));
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

        // Auto close after display duration (only for non-final winners)
        let timer: any;
        if (!isFinal) {
            timer = setTimeout(() => {
                onComplete();
            }, 3000);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onComplete, winner.type, isFinal]);

    return (
        <AnimatePresence>
            <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                    backdropFilter: 'blur(15px)',
                    color: 'white',
                    overflow: 'hidden'
                }}
            >
                {/* 1. BACKGROUND WATERMARK */}
                {teamLogo && (
                    <motion.img
                        src={teamLogo}
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 0.1, scale: 1.5, rotate: 0 }}
                        transition={{ duration: 2 }}
                        style={{
                            position: 'absolute',
                            zIndex: -1,
                            width: '80vh',
                            height: '80vh',
                            objectFit: 'contain',
                            filter: `drop-shadow(0 0 50px ${teamColor}22)`,
                            pointerEvents: 'none'
                        }}
                    />
                )}

                {/* 2. TOP HERO LOGO */}
                {teamLogo && (
                    <motion.img
                        src={teamLogo}
                        initial={{ scale: 0, y: 100, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, type: 'spring', damping: 12, stiffness: 100 }}
                        style={{
                            width: isFinal ? 240 : 160,
                            height: isFinal ? 240 : 160,
                            objectFit: 'contain',
                            marginBottom: 24,
                            zIndex: 10,
                            filter: `drop-shadow(0 0 30px ${teamColor}AA)`
                        }}
                    />
                )}

                {/* 3. ANNOUNCEMENT TITLE */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <Typography variant="h6" sx={{
                        textTransform: 'uppercase',
                        letterSpacing: isFinal ? 16 : 10,
                        fontWeight: 950,
                        color: teamColor,
                        mb: 4,
                        textAlign: 'center',
                        textShadow: isFinal ? `0 0 30px ${teamColor}` : `0 0 20px ${teamColor}66`,
                        fontSize: isFinal ? '1.5rem' : '1.1rem'
                    }}>
                        {isFinal ? rankTheme?.iconLabel : `${winner.event?.name || 'ROUND'} WINNER`}
                    </Typography>
                </motion.div>

                {/* 4. RESULT BOX */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: isFinal ? 1.2 : 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        delay: 1
                    }}
                >
                    <Paper sx={{
                        p: isFinal ? 8 : 6,
                        borderRadius: 2,
                        border: `4px solid ${teamColor}`,
                        boxShadow: `0 0 80px ${teamColor}66`,
                        background: `rgba(15, 23, 42, 0.9)`, // Solid dark for contrast
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: isFinal ? 600 : 450
                    }}>
                        {isFinal && (
                            <Box sx={{
                                position: 'absolute', top: -30, right: -30, fontSize: '12rem',
                                opacity: 0.1, color: 'white', transform: 'rotate(20deg)', pointerEvents: 'none'
                            }}>
                                🏆
                            </Box>
                        )}
                        <Typography sx={{
                            fontWeight: 950,
                            color: 'white',
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            mb: 2,
                            fontSize: isFinal ? '6.5rem' : '4.5rem',
                            letterSpacing: -2
                        }}>
                            {winner.team.name}
                        </Typography>
                        <Typography sx={{
                            fontWeight: 800,
                            color: teamColor,
                            letterSpacing: 4,
                            fontSize: isFinal ? '2rem' : '1.5rem',
                            textTransform: 'uppercase'
                        }}>
                            {winner.team.institution}
                        </Typography>
                    </Paper>
                </motion.div>

                {/* 5. SUB-TITLE */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <Typography sx={{
                        mt: 8,
                        fontWeight: 900,
                        letterSpacing: 6,
                        color: 'white',
                        opacity: 0.8,
                        fontSize: isFinal ? '1.8rem' : '1.2rem',
                        textTransform: 'uppercase'
                    }}>
                        {isFinal ? `OVERALL RANK #${winner.rank}` : `RANK #${winner.rank}`}
                    </Typography>
                </motion.div>

                <Box sx={{
                    position: 'absolute',
                    bottom: 40,
                    width: '100%',
                    textAlign: 'center',
                    opacity: 0.4
                }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 8, textTransform: 'uppercase' }}>
                        SPONTANIA CHAMPIONSHIP PLATFORM • 2026
                    </Typography>
                </Box>
            </Box>
        </AnimatePresence>
    );
}
