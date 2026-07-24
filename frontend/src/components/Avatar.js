import React, { useState } from 'react';

const TINTS = [
    'from-glow-500 to-glow-700',
    'from-sky-500 to-blue-700',
    'from-indigo-500 to-blue-800',
    'from-cyan-500 to-blue-700',
    'from-violet-500 to-indigo-700',
];

const tintFor = (seed = '') =>
    TINTS[(seed.charCodeAt(0) || 0) % TINTS.length];

/**
 * Shows the user's Google profile picture when available,
 * falling back to gradient initials.
 */
export default function Avatar({ user, size = 'w-9 h-9', text = 'text-xs', ring = false }) {
    const [failed, setFailed] = useState(false);

    if (!user) return null;

    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';
    const ringCls = ring ? 'ring-2 ring-white/15' : '';
    const src = user.avatar;

    if (src && !failed) {
        return (
            <img
                src={src}
                alt={`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
                className={`${size} ${ringCls} rounded-full object-cover shrink-0 bg-ink-800`}
            />
        );
    }

    return (
        <div
            className={`${size} ${text} ${ringCls} rounded-full shrink-0 bg-gradient-to-br ${tintFor(
                user.email || initials
            )} text-white font-bold flex items-center justify-center select-none`}
        >
            {initials}
        </div>
    );
}
