import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './NavBar';
import Footer from './Footer';

/**
 * Shared shell for the individual pose detail pages. The artwork itself is a
 * light-background SVG, so it sits inside a light card on the dark page.
 */
export default function PoseDetailLayout({ image, title, sanskrit, tracked = false }) {
    return (
        <div className="min-h-screen bg-ink-950">
            <Navbar />

            <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-28 pb-16">
                <Link
                    to="/yogaclass"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14H4" />
                    </svg>
                    Back to Yoga Class
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
                        {sanskrit && <p className="text-glow-400/80 italic mt-1">{sanskrit}</p>}
                    </div>
                    <div className="flex gap-2">
                        {tracked && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-glow-500/15 text-glow-200 border border-glow-400/30 px-3 py-1.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-glow-300 animate-pulse" />
                                Tracked live
                            </span>
                        )}
                        <Link to="/yoga">
                            <button className="btn-primary !py-2 text-sm">Practice this</button>
                        </Link>
                    </div>
                </div>

                <div className="panel overflow-hidden">
                    <div className="bg-white">
                        <img src={image} alt={`${title} instructions`} className="w-full block" />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
