import React from 'react';
import { poseImages } from '../utils/pose_images';

/**
 * Draws a pose as a lit, volumetric body built from the same 17 keypoints the
 * live session tracks over your webcam feed. The skeleton is fleshed out into
 * tapered limbs, wrapped in a rim-light outline, and shaded from a single
 * top-left light source so it reads as a sculpted figure rather than a stick.
 *
 * `tone` picks the accent: "blue" for normal use, "cyan" when the pose is the
 * active selection.
 */

export default function PoseFigure({ pose, className = '', fit = 'contain' }) {
    const image = poseImages[pose] || poseImages.Triangle;
    if (!image) {
        return <div className={`${className} bg-ink-800 rounded-xl`} aria-hidden="true" />;
    }
    return (
        <img
            src={image}
            alt={`${pose} pose`}
            className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
            loading="lazy"
            decoding="async"
        />
    );
}
