import React from 'react';

/**
 * The Pocket Yoga wordmark. The source PNG is dark text on a transparent
 * background, so on the dark theme we flip it to solid white with
 * `brightness-0 invert`.
 */
export default function Logo({ className = 'h-7', badge }) {
    return (
        <span className="inline-flex items-center gap-2.5">
            <img
                src="/images/logo.png"
                alt="Pocket Yoga"
                className={`${className} w-auto brightness-0 invert`}
            />
            {badge && (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-glow-300 bg-glow-500/15 border border-glow-400/30 px-2 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </span>
    );
}
