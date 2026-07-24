import React, { useId } from 'react';
import { BONES, GROUND_Y, getPoseFigure } from '../utils/poseFigures';

/**
 * Draws a pose as a glowing keypoint figure — the same visual language as the
 * skeleton the live session paints over your webcam feed.
 *
 * `tone` picks the accent: "blue" for normal use, "cyan" when the pose is the
 * active selection.
 */
export default function PoseFigure({ pose, className = '', tone = 'blue', showGround = true }) {
    const id = useId().replace(/:/g, '');
    const joints = getPoseFigure(pose);

    if (!joints) {
        return <div className={`${className} bg-ink-800 rounded-xl`} aria-hidden="true" />;
    }

    const accent = tone === 'cyan' ? '#71AEFF' : '#3B8CFF';
    const bright = tone === 'cyan' ? '#EAF3FF' : '#A9CEFF';

    const head = joints.nose;
    const headR = 6.5;
    // Nudge the neck line down so the bone tucks under the head circle.
    const neck = [
        (joints.left_shoulder[0] + joints.right_shoulder[0]) / 2,
        (joints.left_shoulder[1] + joints.right_shoulder[1]) / 2,
    ];

    const torso = [
        joints.left_shoulder, joints.right_shoulder,
        joints.right_hip, joints.left_hip,
    ].map((p) => p.join(',')).join(' ');

    return (
        <svg
            viewBox="0 0 100 120"
            className={className}
            role="img"
            aria-label={`${pose} pose`}
        >
            <defs>
                <radialGradient id={`bg${id}`} cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`bone${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={bright} />
                    <stop offset="100%" stopColor={accent} />
                </linearGradient>
                <filter id={`blur${id}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.4" />
                </filter>
            </defs>

            <rect width="100" height="120" fill={`url(#bg${id})`} />

            {showGround && (
                <ellipse
                    cx="50" cy={GROUND_Y + 2} rx="38" ry="3.5"
                    fill={accent} opacity="0.18"
                />
            )}

            {/* Soft outer glow pass, then the crisp figure on top. */}
            <g filter={`url(#blur${id})`} opacity="0.55">
                <polygon points={torso} fill={accent} />
                <g stroke={accent} strokeWidth="7" strokeLinecap="round" fill="none">
                    <line x1={head[0]} y1={head[1]} x2={neck[0]} y2={neck[1]} />
                    {BONES.map(([a, b]) => (
                        <line key={`g-${a}-${b}`} x1={joints[a][0]} y1={joints[a][1]} x2={joints[b][0]} y2={joints[b][1]} />
                    ))}
                </g>
                <circle cx={head[0]} cy={head[1]} r={headR} fill={accent} />
            </g>

            <polygon points={torso} fill={accent} opacity="0.3" />

            <g stroke={`url(#bone${id})`} strokeWidth="4.6" strokeLinecap="round" fill="none">
                <line x1={head[0]} y1={head[1]} x2={neck[0]} y2={neck[1]} />
                {BONES.map(([a, b]) => (
                    <line key={`${a}-${b}`} x1={joints[a][0]} y1={joints[a][1]} x2={joints[b][0]} y2={joints[b][1]} />
                ))}
            </g>

            <circle cx={head[0]} cy={head[1]} r={headR} fill={`url(#bone${id})`} />

            {/* Joint markers, skipping the face points the head circle covers. */}
            <g fill="#05070D" stroke={bright} strokeWidth="1.4">
                {Object.entries(joints)
                    .filter(([k]) => !k.includes('eye') && !k.includes('ear') && k !== 'nose')
                    .map(([k, [x, y]]) => (
                        <circle key={k} cx={x} cy={y} r="2.1" />
                    ))}
            </g>
        </svg>
    );
}
