import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleNav = () => setIsNavOpen(!isNavOpen);

    const handleLogout = () => {
        logout();
        setIsNavOpen(false);
        navigate('/');
    };

    const initials = user
        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
        : '';

    const linkBtn = 'py-2 px-1 m-1 text-black text-sm cursor-pointer hover:text-[#3A5A40]';

    const commonLinks = (onClick) => (
        <>
            <Link to="/yogaclass" onClick={onClick}><button className={linkBtn}>Yoga Class</button></Link>
            <Link to="/yoga" onClick={onClick}><button className={linkBtn}>Live Session</button></Link>
            <Link to="/about" onClick={onClick}><button className={linkBtn}>AI Planner</button></Link>
        </>
    );

    return (
        <div className="fixed top-0 w-full z-50 shadow-lg bg-white">
            <div className="flex items-center justify-between h-18 px-6 py-2 md:px-56">
                <a href="/">
                    <img src="/images/logo.png" alt="Logo" className="h-10" />
                </a>

                <div className="flex items-center">
                    {isAuthenticated && (
                        <div className="block sm:hidden mr-4">
                            <div className="w-8 h-8 rounded-full bg-[#3A5A40] text-white flex items-center justify-center text-xs font-bold">
                                {initials}
                            </div>
                        </div>
                    )}
                    <button className="block sm:hidden" onClick={toggleNav}>
                        <div className="w-6 h-6">
                            <svg viewBox="0 0 100 80" width="30" height="30" fill="black">
                                <rect width="100" height="15" rx="8"></rect>
                                <rect y="30" width="100" height="15" rx="8"></rect>
                                <rect y="60" width="100" height="15" rx="8"></rect>
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Side slider menu (mobile) */}
                <div className={`fixed top-0 right-0 h-screen w-52 bg-white z-[1000] transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <button className="absolute top-4 left-4 focus:outline-none" onClick={toggleNav}>
                        <svg className="w-6 h-6 fill-current text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 5.652l-1.414-1.414L10 7.172 7.066 4.238l-1.414 1.414L8.828 10l-3.176 3.176 1.414 1.414L10 12.828l2.934 2.934 1.414-1.414L11.172 10l3.176-3.176z" />
                        </svg>
                    </button>

                    <div className="flex flex-col p-4 py-12">
                        {commonLinks(toggleNav)}
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" onClick={toggleNav}><button className="py-2 px-2 mb-2 text-base text-black text-left">Profile</button></Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={toggleNav}><button className="py-2 px-2 mb-2 text-base text-black text-left">Admin</button></Link>
                                )}
                                <button onClick={handleLogout} className="py-2 px-2 mb-2 text-base text-red-600 text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={toggleNav}><button className="py-2 px-2 mb-2 text-base text-black text-left">Login</button></Link>
                                <Link to="/signup" onClick={toggleNav}><button className="py-2 px-2 mb-2 text-base text-black text-left">Signup</button></Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop links */}
                <div className="hidden sm:flex items-center space-x-4">
                    {commonLinks()}
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile"><button className={linkBtn}>Profile</button></Link>
                            {isAdmin && <Link to="/admin"><button className={linkBtn}>Admin</button></Link>}
                            <div className="w-8 h-8 rounded-full bg-[#3A5A40] text-white flex items-center justify-center text-xs font-bold" title={`${user.firstName} ${user.lastName}`}>
                                {initials}
                            </div>
                            <button onClick={handleLogout} className="py-2 px-3 m-1 text-sm text-white bg-[#3A5A40] rounded-lg hover:bg-[#242F2A]">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"><button className={linkBtn}>Login</button></Link>
                            <Link to="/signup"><button className="py-2 px-3 m-1 text-sm text-white bg-[#3A5A40] rounded-lg hover:bg-[#242F2A]">Signup</button></Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
