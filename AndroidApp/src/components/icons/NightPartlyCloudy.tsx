import React from 'react';

type Props = {
  size?: number;
};

export function NightPartlyCloudyIcon({ size = 28 }: Props) {
  // Simple SVG: crescent moon behind a small cloud
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {/* Moon */}
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#FFC94D" />
        </radialGradient>
      </defs>
      <g transform="translate(6,6)">
        <path
          d="M30 4a14 14 0 1 0 14 22.5A16 16 0 1 1 30 4z"
          fill="url(#moonGlow)"
        />
        {/* Cloud */}
        <g transform="translate(10,22)">
          <path
            d="M34 16a8 8 0 0 0-7.5-8 10 10 0 0 0-19.5 2 6 6 0 0 0-1 12h28a8 8 0 0 0 0-16z"
            fill="#c9d1e6"
          />
          <path
            d="M34 16a8 8 0 0 0-7.5-8 10 10 0 0 0-19.5 2 6 6 0 0 0-1 12h28a8 8 0 0 0 0-16z"
            fill="none"
            stroke="#95a0bd"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </svg>
  );
}


