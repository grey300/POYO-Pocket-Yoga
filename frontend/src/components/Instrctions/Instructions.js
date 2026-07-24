import React from 'react';
import { poseInstructions } from '../../utils/data';
import PoseFigure from '../PoseFigure';

export default function Instructions({ currentPose }) {
    const steps = poseInstructions[currentPose] || [];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div>
                <p className="text-sm font-semibold text-white mb-3">How to do it</p>
                <ol className="space-y-2.5">
                    {steps.map((instruction, index) => (
                        <li key={index} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-glow-500/15 border border-glow-400/30 text-glow-300 text-[11px] font-bold flex items-center justify-center mt-0.5">
                                {index + 1}
                            </span>
                            <span>{instruction}</span>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-ink-900 flex flex-col">
                <PoseFigure pose={currentPose} className="w-full flex-1 max-h-72" />
                <p className="text-center text-[11px] text-slate-500 pb-3 px-3">
                    Target shape — the same joints POYO tracks on your camera.
                </p>
            </div>
        </div>
    );
}
