import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import InteractionEffects from './components/InteractionEffects';

// Keep the landing page (and its 3D hero) in the initial bundle. Heavier pose
// detection, charts, forms, and admin screens load only when visited.
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Yoga = lazy(() => import('./pages/Yoga/Yoga'));
const About = lazy(() => import('./pages/About/About'));
const Yogaclass = lazy(() => import('./pages/YogaClass/Yogaclass'));
const Login = lazy(() => import('./pages/Forms/Login'));
const Signup = lazy(() => import('./pages/Forms/Signup'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const YogaPage1 = lazy(() => import('./pages/YogaPoseDetail/YogaPage1'));
const YogaPage2 = lazy(() => import('./pages/YogaPoseDetail/YogaPage2'));
const YogaPage3 = lazy(() => import('./pages/YogaPoseDetail/YogaPage3'));
const YogaPage4 = lazy(() => import('./pages/YogaPoseDetail/YogaPage4'));
const YogaPage5 = lazy(() => import('./pages/YogaPoseDetail/YogaPage5'));
const YogaPage6 = lazy(() => import('./pages/YogaPoseDetail/YogaPage6'));
const YogaPage7 = lazy(() => import('./pages/YogaPoseDetail/YogaPage7'));
const YogaPage8 = lazy(() => import('./pages/YogaPoseDetail/YogaPage8'));

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
              <InteractionEffects />
              <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/yogaclass" element={<Yogaclass />} />
                    <Route path="/yoga-pose/1" element={<YogaPage1 />} />
                    <Route path="/yoga-pose/2" element={<YogaPage2 />} />
                    <Route path="/yoga-pose/3" element={<YogaPage3 />} />
                    <Route path="/yoga-pose/4" element={<YogaPage4 />} />
                    <Route path="/yoga-pose/5" element={<YogaPage5 />} />
                    <Route path="/yoga-pose/6" element={<YogaPage6 />} />
                    <Route path="/yoga-pose/7" element={<YogaPage7 />} />
                    <Route path="/yoga-pose/8" element={<YogaPage8 />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route
                        path="/yoga"
                        element={
                            <ProtectedRoute>
                                <Yoga />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute>
                                <About />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
              </Suspense>
                <Analytics />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
