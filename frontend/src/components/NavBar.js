import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Logo from './Logo';

const LINKS = [
    ['Yoga Class', '/yogaclass'],
    ['Live Session', '/yoga'],
    ['AI Planner', '/about'],
];

export default function NavBar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        setIsNavOpen(false);
        navigate('/');
    };

    const isActive = (to) => location.pathname === to;
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ink-950/85 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
                }`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-5 sm:px-6">
                {/* Brand */}
                <Link to="/" className="flex items-center">
                    <Logo className="text-lg" />
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {LINKS.map(([label, to]) => (
                        <Link key={to} to={to}>
                            <span
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${isActive(to) ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {label}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((s) => !s)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                                className={`flex items-center rounded-full p-0.5 transition-all ${menuOpen ? 'ring-2 ring-glow-400/60' : 'hover:ring-2 hover:ring-white/20'
                                    }`}
                            >
                                <Avatar user={user} />
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-64 panel shadow-2xl overflow-hidden animate-fadeIn"
                                >
                                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.03]">
                                        <Avatar user={user} size="w-10 h-10" text="text-sm" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{fullName}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {typeof user.currentStreak === 'number' && user.currentStreak > 0 && (
                                        <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
                                            <span className="text-base">🔥</span>
                                            <span className="text-sm text-orange-300 font-medium">
                                                {user.currentStreak}-day streak
                                            </span>
                                        </div>
                                    )}

                                    <div className="py-1">
                                        <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Profile
                                            </button>
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setMenuOpen(false)}>
                                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" /></svg>
                                                    Admin Dashboard
                                                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-glow-500/20 text-glow-300 border border-glow-400/30">admin</span>
                                                </button>
                                            </Link>
                                        )}
                                    </div>

                                    <div className="border-t border-white/10 py-1">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5M21 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6" /></svg>
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login">
                                <button className="text-sm text-slate-400 hover:text-white px-3 py-2 transition-colors">Login</button>
                            </Link>
                            <Link to="/signup">
                                <button className="btn-primary text-sm !py-2">Sign up</button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white"
                        onClick={() => setIsNavOpen((s) => !s)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {isNavOpen ? (
                                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                            ) : (
                                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isNavOpen && (
                <div className="md:hidden bg-ink-950/95 backdrop-blur-md border-t border-white/10 animate-fadeIn">
                    <nav className="px-5 py-4 flex flex-col gap-1">
                        {LINKS.map(([label, to]) => (
                            <Link key={to} to={to} onClick={() => setIsNavOpen(false)}>
                                <span className="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white">
                                    {label}
                                </span>
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <>
                                <div className="my-2 border-t border-white/10" />
                                <Link to="/login" onClick={() => setIsNavOpen(false)}>
                                    <span className="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5">Login</span>
                                </Link>
                                <Link to="/signup" onClick={() => setIsNavOpen(false)}>
                                    <span className="block px-3 py-2.5 rounded-lg text-glow-300 font-medium hover:bg-white/5">Sign up</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
