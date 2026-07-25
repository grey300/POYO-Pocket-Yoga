import React, { useId } from 'react';
import { BONES, GROUND_Y, getPoseFigure } from '../utils/poseFigures';

/**
 * Draws a pose as a lit, volumetric body built from the same 17 keypoints the
 * live session tracks over your webcam feed. The skeleton is fleshed out into
 * tapered limbs, wrapped in a rim-light outline, and shaded from a single
 * top-left light source so it reads as a sculpted figure rather than a stick.
 *
 * `tone` picks the accent: "blue" for normal use, "cyan" when the pose is the
 * active selection.
 */

// Limb thickness per bone — thick through the torso and thighs, tapering out to
// the wrists and ankles, so the body has believable mass.
const LIMB_WIDTH = {
    'left_shoulder,right_shoulder': 6.5,
    'left_hip,right_hip': 7.5,
    'left_shoulder,left_hip': 7.5,
    'right_shoulder,right_hip': 7.5,
    'left_shoulder,left_elbow': 5.4,
    'left_elbow,left_wrist': 4.2,
    'right_shoulder,right_elbow': 5.4,
    'right_elbow,right_wrist': 4.2,
    'left_hip,left_knee': 7,
    'left_knee,left_ankle': 5.4,
    'right_hip,right_knee': 7,
    'right_knee,right_ankle': 5.4,
};
const NECK_WIDTH = 4.8;

export default function PoseFigure({ pose, className = '', tone = 'blue', showGround = true }) {
    const id = useId().replace(/:/g, '');
    const joints = getPoseFigure(pose);

    if (!joints) {
        return <div className={`${className} bg-ink-800 rounded-xl`} aria-hidden="true" />;
    }

    const c = tone === 'cyan'
        ? { light: '#EAF3FF', mid: '#71AEFF', dark: '#1C58B8', rim: '#CFE4FF', glow: '#71AEFF' }
        : { light: '#CFE4FF', mid: '#3B8CFF', dark: '#0A2E6E', rim: '#A9CEFF', glow: '#3B8CFF' };

    const head = joints.nose;
    const headR = 7;
    // Neck: midpoint of the shoulders, so the head bone tucks into the torso.
    const neck = [
        (joints.left_shoulder[0] + joints.right_shoulder[0]) / 2,
        (joints.left_shoulder[1] + joints.right_shoulder[1]) / 2,
    ];

    const torso = [
        joints.left_shoulder, joints.right_shoulder,
        joints.right_hip, joints.left_hip,
    ].map((p) => p.join(',')).join(' ');

    const boneWidth = (a, b) => LIMB_WIDTH[`${a},${b}`] ?? 4.5;

    // One pass over every limb (neck + bones) at a given extra thickness. Used to
    // stack the glow, the rim outline and the shaded body on the same silhouette.
    const limbs = (extra, props) => (
        <g strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
            <line x1={head[0]} y1={head[1]} x2={neck[0]} y2={neck[1]} strokeWidth={NECK_WIDTH + extra} />
            {BONES.map(([a, b]) => (
                <line
                    key={`${a}-${b}`}
                    x1={joints[a][0]} y1={joints[a][1]}
                    x2={joints[b][0]} y2={joints[b][1]}
                    strokeWidth={boneWidth(a, b) + extra}
                />
            ))}
        </g>
    );

    return (
        <svg viewBox="0 0 100 120" className={className} role="img" aria-label={`${pose} pose`}>
            <defs>
                <radialGradient id={`bg${id}`} cx="50%" cy="42%" r="62%">
                    <stop offset="0%" stopColor={c.glow} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
                </radialGradient>

                {/* Single top-left light direction across the whole figure → 3D volume. */}
                <linearGradient id={`body${id}`} gradientUnits="userSpaceOnUse" x1="22" y1="12" x2="82" y2="112">
                    <stop offset="0%" stopColor={c.light} />
                    <stop offset="48%" stopColor={c.mid} />
                    <stop offset="100%" stopColor={c.dark} />
                </linearGradient>

                {/* Spherical head shading with a top-left highlight. */}
                <radialGradient id={`head${id}`} cx="36%" cy="30%" r="78%">
                    <stop offset="0%" stopColor={c.light} />
                    <stop offset="55%" stopColor={c.mid} />
                    <stop offset="100%" stopColor={c.dark} />
                </radialGradient>

                <filter id={`glow${id}`} x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="2.6" />
                </filter>
            </defs>

            <rect width="100" height="120" fill={`url(#bg${id})`} />

            {showGround && (
                <ellipse cx="50" cy={GROUND_Y + 2} rx="34" ry="3.2" fill={c.glow} opacity="0.2" />
            )}

            {/* 1 — soft outer halo */}
            <g filter={`url(#glow${id})`} opacity="0.5">
                <polygon points={torso} fill={c.glow} />
                {limbs(3, { stroke: c.glow })}
                <circle cx={head[0]} cy={head[1]} r={headR + 1.5} fill={c.glow} />
            </g>

            {/* 2 — rim-light outline (slightly larger, bright edge) */}
            <polygon points={torso} fill={c.rim} />
            {limbs(2.6, { stroke: c.rim })}
            <circle cx={head[0]} cy={head[1]} r={headR + 1} fill={c.rim} />

            {/* 3 — shaded body volume on top, leaving the rim showing as an outline */}
            <polygon points={torso} fill={`url(#body${id})`} />
            {limbs(0, { stroke: `url(#body${id})` })}
            <circle cx={head[0]} cy={head[1]} r={headR} fill={`url(#head${id})`} />

            {/* 4 — glossy top-left highlight to sell the rounded volume */}
            <g transform="translate(-0.7,-1)" opacity="0.5">
                {limbs(-2.4, { stroke: c.light, strokeLinecap: 'round' })}
            </g>
            <circle cx={head[0] - 2.1} cy={head[1] - 2.5} r="1.9" fill={c.light} opacity="0.85" />

            {/* Keypoints — subtle glowing articulation nodes, not stick joints. */}
            <g fill={c.light} opacity="0.7">
                {Object.entries(joints)
                    .filter(([k]) => !k.includes('eye') && !k.includes('ear') && k !== 'nose')
                    .map(([k, [x, y]]) => (
                        <circle key={k} cx={x} cy={y} r="1.5" />
                    ))}
            </g>
        </svg>
    );
}
