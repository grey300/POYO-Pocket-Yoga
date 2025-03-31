import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { useNavigate, BrowserRouter, Route, Routes } from 'react-router-dom';
import { ClerkProvider, RedirectToSignIn, SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import Profile from './pages/Profile/Profile';
import Yoga from "./pages/Yoga/Yoga";
import About from "./pages/About/About";
import Yogaclass from "./pages/YogaClass/Yogaclass";
import YogaPage1 from "./pages/YogaPoseDetail/YogaPage1";
import YogaPage2 from "./pages/YogaPoseDetail/YogaPage2";
import YogaPage3 from "./pages/YogaPoseDetail/YogaPage3";
import YogaPage4 from "./pages/YogaPoseDetail/YogaPage4";
import YogaPage5 from "./pages/YogaPoseDetail/YogaPage5";
import YogaPage6 from "./pages/YogaPoseDetail/YogaPage6";
import YogaPage7 from "./pages/YogaPoseDetail/YogaPage7";
import YogaPage8 from "./pages/YogaPoseDetail/YogaPage8";

const clerkPubkey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubkey) {
  console.error("Clerk Publishable Key is missing.");
}

const root = ReactDOM.createRoot(document.getElementById('root'));

const ClerkWithRoutes = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubkey}
      navigate={(to) => navigate(to)}
    >
      <Routes>
        <Route path='/' element={<App />} />
        <Route path="/yoga" element={<Yoga />} />
        <Route path="/about" element={<About />} />
        <Route path="/yogaclass" element={<Yogaclass />} />
        <Route path="/yoga-pose/1" element={<YogaPage1 />} />
        <Route path="/yoga-pose/2" element={<YogaPage2 />} />
        <Route path="/yoga-pose/3" element={<YogaPage3 />} />
        <Route path="/yoga-pose/4" element={<YogaPage4 />} />
        <Route path="/yoga-pose/5" element={<YogaPage5 />} />
        <Route path="/yoga-pose/6" element={<YogaPage6 />} />
        <Route path="/yoga-pose/7" element={<YogaPage7 />} />
        <Route path="/yoga-pose/8" element={<YogaPage8 />} />
        <Route path='/sign-in/*' element={<SignIn routing='path' redirectUrl='/' />} />
        <Route path='/sign-up/*' element={<SignUp routing='path' redirectUrl='/' />} />
        <Route
          path='/profile'
          element={
            <>
              <SignedIn>
                <Profile />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
};

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkWithRoutes />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
