import React from 'react';
import { Link } from 'react-router-dom';
import PoseFigure from './PoseFigure';

const POSES = [
    { name: 'Tree', detail: '/yoga-pose/1', blurb: 'Balance & focus' },
    { name: 'Chair', detail: '/yoga-pose/2', blurb: 'Legs & core' },
    { name: 'Cobra', detail: '/yoga-pose/3', blurb: 'Spine & chest' },
    { name: 'Warrior', detail: '/yoga-pose/4', blurb: 'Strength & stance' },
    { name: 'Dog', detail: '/yoga-pose/5', blurb: 'Full-body stretch' },
    { name: 'Shoulderstand', detail: '/yoga-pose/6', blurb: 'Inversion & calm' },
];

const Yogapose = () => (
    <section className="relative bg-ink-900 py-20 sm:py-28 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                    <p className="text-xs uppercase tracking-widest text-glow-400 font-semibold">Pose Library</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Six poses, tracked live
                    </h2>
                    <p className="mt-3 text-slate-400 max-w-lg">
                        Each one is recognized by the classifier in real time. Tap any pose to read the technique.
                    </p>
                </div>
                <Link to="/yogaclass">
                    <button className="btn-ghost whitespace-nowrap">
                        View all
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {POSES.map((p) => (
                    <Link key={p.name} to={p.detail} className="group">
                        <div className="panel panel-hover overflow-hidden">
                            <div className="relative aspect-[3/4] overflow-hidden bg-ink-800 flex items-center justify-center p-2">
                                <PoseFigure
                                    pose={p.name}
                                    className="h-full w-auto opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                            </div>
                            <div className="p-3">
                                <p className="font-semibold text-white text-sm">{p.name}</p>
                                <p className="text-xs text-slate-500">{p.blurb}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

export default Yogapose;
