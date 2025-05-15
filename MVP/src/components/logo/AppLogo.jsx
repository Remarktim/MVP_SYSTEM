import React from "react";

const AppLogo = ({ width = 300, height = 80 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <style>
        {`.text { font-family: 'Segoe UI', sans-serif; font-weight: bold; fill: #1E3A8A; } /* dark blue */
          .highlight { fill: #3B82F6; } /* vibrant blue */
          .subtext { font-size: 12px; font-weight: normal; fill: #60A5FA; } /* light blue */`}
      </style>
      {/* Icon: 3 people interconnected */}
      <circle
        cx="25"
        cy="40"
        r="8"
        fill="#3B82F6"
      />
      <circle
        cx="45"
        cy="25"
        r="8"
        fill="#3B82F6"
      />
      <circle
        cx="45"
        cy="55"
        r="8"
        fill="#3B82F6"
      />
      <line
        x1="25"
        y1="40"
        x2="45"
        y2="25"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <line
        x1="25"
        y1="40"
        x2="45"
        y2="55"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <line
        x1="45"
        y1="25"
        x2="45"
        y2="55"
        stroke="#3B82F6"
        strokeWidth="2"
      />

      {/* Text */}
      <text
        x="70"
        y="38"
        fontSize="20"
        className="text">
        Community <tspan className="highlight">Connect</tspan>
      </text>
      <text
        x="70"
        y="58"
        className="subtext">
        MVP
      </text>
    </svg>
  );
};

export default AppLogo;
