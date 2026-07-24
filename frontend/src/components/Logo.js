import React from 'react';

/**
 * The Pocket Yoga wordmark, set as type rather than an image so it stays sharp
 * and picks up the dark theme's colours.
 */
export default function Logo({ className = 'text-lg', badge }) {
    return (
        <span className="inline-flex items-baseline gap-2.5">
            <span className={`${className} font-bold tracking-tight text-white`}>
                Pocket<span className="text-glow-400">Yoga</span>
            </span>
            {badge && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-glow-300 bg-glow-500/15 border border-glow-400/30 px-2 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </span>
    );
}
