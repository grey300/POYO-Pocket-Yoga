import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards routes that require a logged-in user (and optionally an admin).
// `adminOnly` redirects non-admins to the admin login.
export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading…
            </div>
        );
    }

    if (!isAuthenticated) {
        const redirectTo = adminOnly ? '/admin/login' : '/login';
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
