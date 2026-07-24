import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const toggleNav = () => setIsNavOpen((s) => !s);

    // Close the account dropdown on outside click or Escape.
    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
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

    const initials = user
        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
        : '';
    const fullName = user ? `${user.firstName} ${user.lastName}` : '';

    const linkBtn = 'py-2 px-1 m-1 text-black text-sm cursor-pointer hover:text-[#3A5A40] transition-colors';

    const commonLinks = (onClick) => (
        <>
            <Link to="/yogaclass" onClick={onClick}><button className={linkBtn}>Yoga Class</button></Link>
            <Link to="/yoga" onClick={onClick}><button className={linkBtn}>Live Session</button></Link>
            <Link to="/about" onClick={onClick}><button className={linkBtn}>AI Planner</button></Link>
        </>
    );

    const Avatar = ({ size = 'w-9 h-9', text = 'text-xs' }) => (
        <div className={`${size} rounded-full bg-[#3A5A40] text-white flex items-center justify-center ${text} font-bold shrink-0`}>
            {initials}
        </div>
    );

    return (
        <div className="fixed top-0 w-full z-50 shadow-lg bg-white">
            <div className="flex items-center justify-between h-18 px-6 py-2 md:px-56">
                <a href="/">
                    <img src="/images/logo.png" alt="Logo" className="h-10" />
                </a>

                {/* Mobile: avatar + hamburger */}
                <div className="flex items-center sm:hidden">
                    {isAuthenticated && <div className="mr-3"><Avatar size="w-8 h-8" /></div>}
                    <button onClick={toggleNav} aria-label="Open menu">
                        <svg viewBox="0 0 100 80" width="26" height="26" fill="black">
                            <rect width="100" height="15" rx="8"></rect>
                            <rect y="30" width="100" height="15" rx="8"></rect>
                            <rect y="60" width="100" height="15" rx="8"></rect>
                        </svg>
                    </button>
                </div>

                {/* Mobile slide-out */}
                <div className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <button className="absolute top-4 right-4" onClick={toggleNav} aria-label="Close menu">
                        <svg className="w-5 h-5 fill-current text-slate-500" viewBox="0 0 20 20">
                            <path d="M14.348 5.652l-1.414-1.414L10 7.172 7.066 4.238l-1.414 1.414L8.828 10l-3.176 3.176 1.414 1.414L10 12.828l2.934 2.934 1.414-1.414L11.172 10l3.176-3.176z" />
                        </svg>
                    </button>

                    {isAuthenticated && (
                        <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-100">
                            <Avatar size="w-10 h-10" text="text-sm" />
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">{fullName}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <div className={`flex flex-col p-4 ${isAuthenticated ? '' : 'pt-14'}`}>
                        {commonLinks(toggleNav)}
                        <div className="my-2 border-t border-slate-100" />
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" onClick={toggleNav}><button className="w-full py-2 px-2 mb-1 text-base text-black text-left hover:text-[#3A5A40]">Profile</button></Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={toggleNav}><button className="w-full py-2 px-2 mb-1 text-base text-black text-left hover:text-[#3A5A40]">Admin Dashboard</button></Link>
                                )}
                                <button onClick={handleLogout} className="w-full py-2 px-2 text-base text-red-600 text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={toggleNav}><button className="w-full py-2 px-2 mb-1 text-base text-black text-left">Login</button></Link>
                                <Link to="/signup" onClick={toggleNav}><button className="w-full py-2 px-2 text-base text-black text-left">Signup</button></Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden sm:flex items-center space-x-4">
                    {commonLinks()}

                    {isAuthenticated ? (
                        <div className="relative ml-2" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((s) => !s)}
                                className={`flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors ${menuOpen ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <Avatar />
                                <svg
                                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden origin-top-right animate-[fadeIn_120ms_ease-out]"
                                >
                                    {/* Account header */}
                                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                                        <Avatar size="w-10 h-10" text="text-sm" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Profile
                                            </button>
                                        </Link>

                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setMenuOpen(false)}>
                                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" /></svg>
                                                    Admin Dashboard
                                                    <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">admin</span>
                                                </button>
                                            </Link>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5M21 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6" /></svg>
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login"><button className={linkBtn}>Login</button></Link>
                            <Link to="/signup"><button className="py-2 px-3 m-1 text-sm text-white bg-[#3A5A40] rounded-lg hover:bg-[#242F2A] transition-colors">Signup</button></Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
