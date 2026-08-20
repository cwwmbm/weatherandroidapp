import React from 'react';

type Props = {
  size?: number;
};

/** Sun + cloud + single light raindrop — trace precip / chance of brief rain */
export function TracePrecipIcon({ size = 28 }: Props) {
  const uid = React.useId().replace(/:/g, '');
  const sunGrad = `traceSun-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="trace-precip-icon"
    >
      <defs>
        <radialGradient id={sunGrad} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FFB020" />
        </radialGradient>
      </defs>
      {/* Sun */}
      <circle cx="22" cy="20" r="11" fill={`url(#${sunGrad})`} />
      {/* Cloud */}
      <path
        d="M48 30a7 7 0 0 0-6.8-7 9 9 0 0 0-17.2 1.5 5.5 5.5 0 0 0-1 10.5h25.5a6.5 6.5 0 0 0 0-13z"
        fill="#c9d1e6"
      />
      <path
        d="M48 30a7 7 0 0 0-6.8-7 9 9 0 0 0-17.2 1.5 5.5 5.5 0 0 0-1 10.5h25.5a6.5 6.5 0 0 0 0-13z"
        fill="none"
        stroke="#95a0bd"
        strokeOpacity="0.65"
        strokeWidth="1.25"
      />
      {/* Single light raindrop */}
      <path
        d="M34 44c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2.4-4 7-4 7s-4-4.6-4-7z"
        fill="#5eb3ff"
      />
      <path
        d="M34 44c0-2.2 1.8-4 4-4s4 1.8 4 4c0 2.4-4 7-4 7s-4-4.6-4-7z"
        fill="none"
        stroke="#3d8fd9"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
