/** @format */

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider2 = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [slidesToShow, setSlidesToShow] = useState(4); // Default to 4 slides

  useEffect(() => {
    const handleResize = () => {
      // Adjust slidesToShow based on window width
      if (window.innerWidth < 768) {
        setSlidesToShow(1); // Show one slide for phone version
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setSlidesToShow(2); // Show two slides for tablet version
      } else {
        setSlidesToShow(4); // Show four slides for larger screens
      }
    };

    // Attach resize event listener
    window.addEventListener("resize", handleResize);

    // Initial call to set slidesToShow based on initial window width
    handleResize();

    // Cleanup: remove resize event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    appendDots: (dots) => (
      <div style={{ bottom: "-50px" }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: (i) => (
      <div
        style={{
          width: "20px",
          height: "5px",
          background: "#000", // Set the background color to black
          borderRadius: "5px",
        }}
      ></div>
    ),
  };

  const getSlideDescription = (index) => {
    switch (index) {
      case 1:
        return "Description for Image 1";
      case 2:
        return "Description for Image 2";
      case 3:
        return "Description for Image 3";
      case 4:
        return "Description for Image 4";
      default:
        return "";
    }
  };

  const detailDescription = (index) => {
    switch (index) {
      case 1:
        return "This is a detailed description for Image 1";
      case 2:
        return "This is a detailed description for Image 2";
      case 3:
        return "This is a detailed description for Image 3";
      case 4:
        return "This is a detailed description for Image 4";
      default:
        return "";
    }
  };

  return (
    <div className="px-8 xl:px-16 py-24">
      <Slider {...settings}>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`text-white px-4 relative ${
              hoveredIndex === index ? "hovered" : ""
            }`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={`/images/pose${index}.svg`}
              alt={index}
              className="w-full h-auto"
            />
            {hoveredIndex === index && (
              <div className="glass-effect absolute bottom-0 px-8 md:px-11 xl:px-9 flex flex-col items-center justify-center  h-1/2  w-auto xl:w-auto  bg-opacity-40 bg-black backdrop-filter backdrop-blur-md">
                <p className="text-lg font-semibold mb-2 text-white">
                  {getSlideDescription(index)}
                </p>
                <p className="text-white text-[12px]">
                  {detailDescription(index)}.
                </p>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Slider2;
