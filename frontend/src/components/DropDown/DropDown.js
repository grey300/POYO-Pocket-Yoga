import React from 'react';
import PoseFigure from '../PoseFigure';

/**
 * Visual pose picker. Keeps the original props so the live session page
 * can swap poses without any other changes.
 */
export default function DropDown({ poseList, currentPose, setCurrentPose }) {
    return (
        <div>
            <p className="label">Choose a pose</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {poseList.map((pose) => {
                    const active = pose === currentPose;
                    return (
                        <button
                            key={pose}
                            type="button"
                            onClick={() => setCurrentPose(pose)}
                            aria-pressed={active}
                            className={`group relative rounded-xl border p-2 transition-all ${active
                                ? 'border-glow-400 bg-glow-500/10 shadow-glow'
                                : 'border-white/10 bg-ink-900 hover:border-white/25 hover:bg-ink-800'
                                }`}
                        >
                            <PoseFigure
                                pose={pose}
                                tone={active ? 'cyan' : 'blue'}
                                className={`w-full aspect-square rounded-lg transition-opacity ${active ? 'opacity-100' : 'opacity-55 group-hover:opacity-85'
                                    }`}
                            />
                            <span
                                className={`block text-[11px] mt-1.5 font-medium truncate ${active ? 'text-glow-200' : 'text-slate-400'
                                    }`}
                            >
                                {pose}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
