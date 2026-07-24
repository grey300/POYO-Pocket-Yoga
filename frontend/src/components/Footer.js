import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
    <footer className="bg-ink-900 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                <div>
                    <div className="mb-3">
                        <Logo className="text-lg" />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                        Pocket Yoga — practice with real-time pose feedback, powered by on-device machine learning.
                    </p>
                </div>

                <div>
                    <p className="text-sm font-semibold text-white mb-3">Explore</p>
                    <ul className="space-y-2 text-sm">
                        {[
                            ['Live Session', '/yoga'],
                            ['Yoga Class', '/yogaclass'],
                            ['AI Planner', '/about'],
                            ['Profile', '/profile'],
                        ].map(([label, to]) => (
                            <li key={to}>
                                <Link to={to} className="text-slate-400 hover:text-glow-300 transition-colors">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-sm font-semibold text-white mb-3">Contact</p>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li>Thimphu, Bhutan</li>
                        <li>773424433</li>
                        <li>poyo@gmail.com</li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-600">© {new Date().getFullYear()} Pocket Yoga (POYO). All rights reserved.</p>
                <p className="text-xs text-slate-600">Built with TensorFlow.js · MoveNet</p>
            </div>
        </div>
    </footer>
);

export default Footer;
