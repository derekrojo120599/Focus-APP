import React from "react";
import { MOOD_COLOR } from "../utils/constants";

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function Companion({ level, mood, size = 240 }) {
  const bodyColor = MOOD_COLOR[mood];
  const tilt = mood === "sad" ? -6 : mood === "happy" ? 2 : 0;

  // Gamification elements scale with level
  const bodyR = 28 + Math.min(level, 8) * 1.5; // Slightly larger base for the owl body
  const flowerCount = level >= 5 ? Math.min(level - 4, 8) : 0;
  const fruitCount = level >= 10 ? Math.min(level - 9, 6) : 0;
  const auraRings = level >= 12 ? Math.min(Math.floor((level - 11) / 2) + 1, 4) : 0;
  const orbitCount = level >= 15 ? Math.min(level - 14, 6) : 0;
  const hasCrown = level >= 18;
  const auraPalette = ["#95C84F", "#FFE14F", "#7BA07F", "#DED9B8"];

  return (
    <div className={`companion-stage mood-${mood}`}>
      <div className="companion-glow" style={{ background: `radial-gradient(circle, ${bodyColor}55 0%, transparent 70%)` }} />
      {mood === "happy" && level < 15 && (
        <div className="sparkles">
          <span className="spark s1" /><span className="spark s2" /><span className="spark s3" />
        </div>
      )}
      <svg width={size} height={size} viewBox="0 0 200 200" className="companion-svg" style={{ "--tilt": `${tilt}deg` }}>
        <ellipse cx="100" cy="170" rx="42" ry="6" fill="#000" opacity="0.28" />

        {Array.from({ length: auraRings }).map((_, i) => (
          <circle
            key={`ring-${i}`} cx="100" cy="95" r={bodyR + 26 + i * 13} fill="none"
            stroke={auraPalette[i % auraPalette.length]} strokeWidth="2" opacity="0.35"
            className="aura-ring" style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}

        {Array.from({ length: orbitCount }).map((_, i) => {
          const [x, y] = polar(100, 95, bodyR + 42, (360 / orbitCount) * i - 90);
          return (
            <circle key={`orbit-${i}`} cx={x} cy={y} r="3.2" fill="#F4D58D" className="orbit-spark" style={{ animationDelay: `${i * 0.3}s` }} />
          );
        })}

        <g className="companion-plant">
          {/* Owl Feet */}
          <ellipse cx={100 - bodyR * 0.4} cy={95 + bodyR * 1.05} rx={bodyR * 0.25} ry={bodyR * 0.1} fill="#FFC800" />
          <ellipse cx={100 + bodyR * 0.4} cy={95 + bodyR * 1.05} rx={bodyR * 0.25} ry={bodyR * 0.1} fill="#FFC800" />
          
          {/* Owl Wings */}
          <path d={`M ${100 - bodyR} ${95} Q ${100 - bodyR - 20} ${95 + bodyR*0.6} ${100 - bodyR + 5} ${95 + bodyR - 2} Z`} fill={bodyColor} />
          <path d={`M ${100 + bodyR} ${95} Q ${100 + bodyR + 20} ${95 + bodyR*0.6} ${100 + bodyR - 5} ${95 + bodyR - 2} Z`} fill={bodyColor} />

          {/* Owl Body Base */}
          <rect x={100 - bodyR} y={95 - bodyR} width={bodyR * 2} height={bodyR * 2.1} rx={bodyR * 0.9} fill={bodyColor} />
          <rect x={100 - bodyR} y={95 - bodyR} width={bodyR * 2} height={bodyR * 2.1} rx={bodyR * 0.9} fill="url(#sheen)" opacity="0.25" />
          
          <defs>
            <radialGradient id="sheen" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Belly & Face Mask */}
          <g fill="white" opacity="0.6">
             <rect x={100 - bodyR*0.8} y={95 - bodyR*0.3} width={bodyR*1.6} height={bodyR*1.15} rx={bodyR*0.5} />
             <circle cx={100 - bodyR*0.35} cy={95 - bodyR*0.2} r={bodyR*0.48} />
             <circle cx={100 + bodyR*0.35} cy={95 - bodyR*0.2} r={bodyR*0.48} />
          </g>

          {/* Eyes Base */}
          <circle cx={100 - bodyR * 0.35} cy={95 - bodyR * 0.2} r={bodyR * 0.35} fill="white" />
          <circle cx={100 + bodyR * 0.35} cy={95 - bodyR * 0.2} r={bodyR * 0.35} fill="white" />
          
          {/* Pupils & Eye Expressions */}
          {mood === "sad" ? (
            <g>
              <circle cx={100 - bodyR * 0.35} cy={95 - bodyR * 0.2} r={bodyR * 0.15} fill="#12201A" />
              <circle cx={100 + bodyR * 0.35} cy={95 - bodyR * 0.2} r={bodyR * 0.15} fill="#12201A" />
              {/* Drooping Eyelids */}
              <path d={`M ${100 - bodyR * 0.75} ${95 - bodyR * 0.5} Q ${100 - bodyR * 0.35} ${95 - bodyR * 0.1} ${100} ${95 - bodyR * 0.5} Z`} fill={bodyColor} />
              <path d={`M ${100} ${95 - bodyR * 0.5} Q ${100 + bodyR * 0.35} ${95 - bodyR * 0.1} ${100 + bodyR * 0.75} ${95 - bodyR * 0.5} Z`} fill={bodyColor} />
            </g>
          ) : mood === "happy" ? (
            <g>
              {/* Happy curved eyes */}
              <path d={`M ${100 - bodyR * 0.55} ${95 - bodyR * 0.2} Q ${100 - bodyR * 0.35} ${95 - bodyR * 0.45} ${100 - bodyR * 0.15} ${95 - bodyR * 0.2}`} stroke="#12201A" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d={`M ${100 + bodyR * 0.15} ${95 - bodyR * 0.2} Q ${100 + bodyR * 0.35} ${95 - bodyR * 0.45} ${100 + bodyR * 0.55} ${95 - bodyR * 0.2}`} stroke="#12201A" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <circle cx={100 - bodyR * 0.3} cy={95 - bodyR * 0.2} r={bodyR * 0.15} fill="#12201A" />
              <circle cx={100 + bodyR * 0.3} cy={95 - bodyR * 0.2} r={bodyR * 0.15} fill="#12201A" />
            </g>
          )}

          {/* Beak */}
          <path d={`M 92 ${95 + bodyR * 0.05} L 108 ${95 + bodyR * 0.05} L 100 ${95 + bodyR * 0.25} Z`} fill="#FFC800" stroke="#E5B200" strokeWidth="1" strokeLinejoin="round" />

          {/* Floating Gamification Elements */}
          {Array.from({ length: flowerCount }).map((_, i) => {
            const [x, y] = polar(100, 95, bodyR + 24, (360 / flowerCount) * i - 90);
            return <circle key={`flower-${i}`} cx={x} cy={y} r="6.5" fill="#FFE14F" stroke="#12201A" strokeWidth="0.5" />;
          })}

          {Array.from({ length: fruitCount }).map((_, i) => {
            const angle = 60 + (60 / Math.max(fruitCount - 1, 1)) * i;
            const [x, y] = polar(100, 95, bodyR + 32, angle);
            return <circle key={`fruit-${i}`} cx={x} cy={y} r="4.5" fill="#D9857A" />;
          })}

          {hasCrown && (
            <g transform={`translate(100, ${95 - bodyR - 10})`}>
              <path d="M -14 6 L -9 -9 L 0 1 L 9 -9 L 14 6 Z" fill="#F4D58D" stroke="#E7A33E" strokeWidth="1" />
              <circle cx="0" cy="-9" r="2.4" fill="#E7A33E" />
              <circle cx="-9" cy="-6" r="2" fill="#E7A33E" />
              <circle cx="9" cy="-6" r="2" fill="#E7A33E" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
