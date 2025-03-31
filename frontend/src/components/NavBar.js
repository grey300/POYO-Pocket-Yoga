import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';


export default function NavBar() {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };
    return (
        <div className="fixed top-0 w-full z-50 shadow-lg bg-white">
            <div className={`flex items-center justify-between h-18 px-6 py-2 md:px-56`}>
                <a href="/">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-10"
                    />
                </a>
                <div className="flex items-center">
                    <SignedIn>
                        <div className="block sm:hidden mr-4 mt-2">
                            <UserButton afterSignOutUrl='/' />
                        </div>
                    </SignedIn>

                    {/* Hamburger menu button */}
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
                {/* Side slider menu */}
                <div className={`fixed top-0 right-0 h-screen w-52 bg-white z-1000 transform transition-transform duration-300 ease-in-out ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Close button */}
                    <button
                        className="absolute top-4 left-4 focus:outline-none"
                        onClick={toggleNav}
                    >
                        <svg
                            className="w-6 h-6 fill-current text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M14.348 5.652l-1.414-1.414L10 7.172 7.066 4.238l-1.414 1.414L8.828 10l-3.176 3.176 1.414 1.414L10 12.828l2.934 2.934 1.414-1.414L11.172 10l3.176-3.176z" />
                        </svg>
                    </button>

                    {/* Menu content */}
                    <div className="flex flex-col p-4 py-12">
                        <Link to='/yogaclass' onClick={toggleNav}>
                            <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                Yoga Class
                            </button>
                        </Link>
                        <Link to='/yoga' onClick={toggleNav}>
                            <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                Live Session
                            </button>
                        </Link>
                        <Link to='/about' onClick={toggleNav}>
                            <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                AI Planner
                            </button>
                        </Link>
                        <SignedIn>
                            <Link to='/profile' onClick={toggleNav}>
                                <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                    Profile
                                </button>
                            </Link>
                        </SignedIn>
                        <SignedOut>
                            <Link to='/profile' onClick={toggleNav}>
                                <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                    Login
                                </button>
                            </Link>
                            <Link to='/profile' onClick={toggleNav}>
                                <button className="py-2 px-2 mb-2 text-base text-black text-left bg-transparent outline-none cursor-pointer">
                                    Signup
                                </button>
                            </Link>
                        </SignedOut>
                    </div>
                </div>
                {/* Navigation links for larger screens */}
                <div className="hidden sm:flex space-x-4">
                    <SignedIn>
                        <Link to='/yogaclass'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Yoga Class</button>
                        </Link>
                        <Link to='/yoga'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Live Session</button>
                        </Link>
                        <Link to='/about'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">AI Planner</button>
                        </Link>
                        <Link to='/profile'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Profile</button>
                        </Link>
                        <UserButton afterSignOutUrl='/' />
                    </SignedIn>
                    <SignedOut>
                        <Link to='/yogaclass'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Yoga Class</button>
                        </Link>
                        <Link to='/yoga'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Live Session</button>
                        </Link>
                        <Link to='/about'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">About Us</button>
                        </Link>
                        <Link to='/profile'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Login</button>
                        </Link>
                        <Link to='/profile'>
                            <button className="py-2 px-1 m-1 text-black text-sm cursor-pointer">Signup</button>
                        </Link>
                    </SignedOut>
                </div>
            </div>
        </div>
    )
}
