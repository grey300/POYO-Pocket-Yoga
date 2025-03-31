/** @format */

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Ypose from "../YogaPoseDetail/yogapose8.svg";

function YogaPage8() {
  return (
    <div>
      <Navbar />
      <div className="relative">
        <img src={Ypose} alt="Yoga Pose 8" className="w-full" />
        <Link
          to="/Yogaclass"
          className="absolute top-20 left-20 m-4 text-black-500 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 inline-block mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 19l-7-7 7-7m8 14h-16"
            />
          </svg>
          <span>Back</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default YogaPage8;
