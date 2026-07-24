import React from 'react';

const FEATURES = [
    {
        title: 'Real-time form check',
        body: 'MoveNet tracks 17 joints from your webcam and a trained classifier confirms the pose — about ten times a second.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5l-1.4 1.4M7.9 16.1l-1.4 1.4m0-11l1.4 1.4m8.2 8.2l1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z" />
        ),
    },
    {
        title: 'Only counts what you hold',
        body: 'The timer runs while your form is correct and pauses the moment it slips, so your best time is genuinely earned.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    },
    {
        title: 'Streaks that stick',
        body: 'Practice on consecutive days to build a streak. Your run shows on your profile and the global leaderboard.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c1.5 3 4.5 4.2 4.5 8a4.5 4.5 0 11-9 0c0-1.6.7-2.7 1.5-3.7.3 1 .9 1.7 1.6 2C11.4 7 12 5.2 12 3z" />,
    },
    {
        title: 'Plans made for you',
        body: 'Tell the AI planner your age, height, weight and level and get a routine built from the poses POYO can track.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    },
    {
        title: 'Private by design',
        body: 'Video never leaves your device — detection runs entirely in your browser. Only your hold times are saved.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    },
    {
        title: 'Compete globally',
        body: 'Every pose has its own leaderboard ranking all practitioners by their longest verified hold.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m6-17H6v5a6 6 0 0012 0V4zM6 6H3v2a4 4 0 004 4m11-6h3v2a4 4 0 01-4 4" />,
    },
];

const Benifits = () => (
    <section className="relative bg-ink-950 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
            <div className="max-w-2xl mb-14">
                <p className="text-xs uppercase tracking-widest text-glow-400 font-semibold">Why POYO</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    A yoga app that actually <span className="text-gradient">watches you</span>
                </h2>
                <p className="mt-4 text-slate-400 leading-relaxed">
                    Most apps just play a video. POYO uses on-device machine learning to tell whether you're really
                    in the pose — and rewards you for staying there.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((f) => (
                    <div key={f.title} className="panel panel-hover p-6 group">
                        <div className="w-11 h-11 rounded-xl bg-glow-500/10 border border-glow-400/25 text-glow-300 flex items-center justify-center mb-4 transition-colors group-hover:bg-glow-500/20">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                                {f.icon}
                            </svg>
                        </div>
                        <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Benifits;
