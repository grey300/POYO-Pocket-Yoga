/** @format */

import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import Yoga from "./pages/Yoga/Yoga";
import About from "./pages/About/About";
import Yogaclass from "./pages/YogaClass/Yogaclass";
import Profile from "./pages/Profile/Profile";
import YogaPage1 from "./pages/YogaPoseDetail/YogaPage1";
import YogaPage2 from "./pages/YogaPoseDetail/YogaPage2";
import YogaPage3 from "./pages/YogaPoseDetail/YogaPage3";
import YogaPage4 from "./pages/YogaPoseDetail/YogaPage4";
import YogaPage5 from "./pages/YogaPoseDetail/YogaPage5";
import YogaPage6 from "./pages/YogaPoseDetail/YogaPage6";
import YogaPage7 from "./pages/YogaPoseDetail/YogaPage7";
import YogaPage8 from "./pages/YogaPoseDetail/YogaPage8";

import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
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
    </Routes>
  );
}
