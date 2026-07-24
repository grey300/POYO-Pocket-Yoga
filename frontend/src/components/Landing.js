import React from 'react';
import { Link } from 'react-router-dom';
import YogaHero3D from './YogaHero3D';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-ink-950">
            <div className="aurora" />

            {/* subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(59,140,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(59,140,255,0.25) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                    maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 72%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 72%)',
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto w-full px-5 sm:px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Copy */}
                <div className="animate-rise">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-glow-300 bg-glow-500/10 border border-glow-400/25 px-3 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-glow-400 animate-pulse" />
                        Real-time pose AI
                    </span>

                    <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                        <span className="text-white">Mindful moves,</span>
                        <br />
                        <span className="text-gradient">intelligent grooves.</span>
                    </h1>

                    <p className="mt-5 text-slate-400 text-lg leading-relaxed max-w-lg">
                        POYO watches your posture through your webcam, tells you the moment you nail the pose, and
                        times every hold — so you can practice yoga with real feedback instead of guesswork.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to={isAuthenticated ? '/yoga' : '/signup'}>
                            <button className="btn-primary text-base px-6 py-3">
                                {isAuthenticated ? 'Start a session' : 'Get started free'}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </button>
                        </Link>
                        <Link to="/yogaclass">
                            <button className="btn-ghost text-base px-6 py-3">Browse poses</button>
                        </Link>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                        {[
                            ['17', 'body points tracked'],
                            ['6', 'poses recognized'],
                            ['~10x', 'checks per second'],
                        ].map(([stat, label]) => (
                            <div key={label}>
                                <p className="text-2xl font-extrabold text-white">{stat}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D scene */}
                <div className="relative h-[380px] sm:h-[480px] lg:h-[560px]">
                    <div className="absolute inset-0 rounded-full bg-glow-500/10 blur-3xl animate-pulseGlow" />
                    <YogaHero3D className="relative w-full h-full" />
                    <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-slate-600 tracking-wide">
                        live skeleton · 17 keypoints
                    </p>
                </div>
            </div>
        </section>
    );
}
