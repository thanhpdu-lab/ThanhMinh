
import React, { useEffect, useState } from 'react';

interface RoseProps {
  isBloomed: boolean;
  onClick: () => void;
}

const Rose: React.FC<RoseProps> = ({ isBloomed, onClick }) => {
  const [shouldWobble, setShouldWobble] = useState(false);

  useEffect(() => {
    if (isBloomed) {
      setShouldWobble(true);
      const timer = setTimeout(() => setShouldWobble(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isBloomed]);

  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-1000 transform 
        ${isBloomed ? 'scale-100' : 'scale-100 hover:scale-105'}
        ${shouldWobble ? 'animate-wobble' : ''}`}
    >
      <style>{`
        @keyframes wobble {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-1deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wobble {
          animation: wobble 0.8s ease-in-out;
        }
        /* Custom cubic-bezier for a "powerful" popping effect */
        .bloom-transition {
          transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      
      <svg width="500" height="650" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stem */}
        <path 
          d="M200 480 C210 400 190 300 200 180" 
          stroke="#66BB6A" 
          strokeWidth="12" 
          strokeLinecap="round" 
        />

        {/* Leaves */}
        <g className="transition-all duration-1000" style={{ opacity: isBloomed ? 1 : 0.8 }}>
          <path 
            d="M205 320 C250 320 290 280 300 250 C260 250 220 280 205 320 Z" 
            fill="#66BB6A" 
            className="transition-transform duration-1000"
            style={{ transformOrigin: '205px 320px', transform: isBloomed ? 'rotate(15deg) scale(1.2)' : 'none' }}
          />
          <path 
            d="M195 370 C150 370 110 330 100 300 C130 300 170 330 195 370 Z" 
            fill="#66BB6A" 
            className="transition-transform duration-1000"
            style={{ transformOrigin: '195px 370px', transform: isBloomed ? 'rotate(-15deg) scale(1.2)' : 'none' }}
          />
        </g>

        {/* Flower Head */}
        <g style={{ transformOrigin: '200px 180px' }}>
          
          {/* Petal Container - Blooming from 1.0 to 2.5 with a bounce */}
          <g className="bloom-transition" 
             style={{ 
               transform: isBloomed ? 'scale(2.5)' : 'scale(1.25)', 
               transformOrigin: '200px 180px' 
             }}>
            
            {/* The 5 Petals */}
            {[0, 72, 144, 216, 288].map((angle, index) => (
              <g key={index} style={{ transform: `rotate(${angle}deg)`, transformOrigin: '200px 180px' }}>
                <path 
                  d="M200 180 C175 180 160 140 200 120 C240 140 225 180 200 180 Z" 
                  fill={index % 2 === 0 ? "#FBC02D" : "#FFEB3B"}
                  className="transition-all duration-1000"
                  style={{ 
                    transform: isBloomed ? 'translateY(-20px)' : 'translateY(0)',
                    opacity: 0.95,
                    filter: isBloomed ? 'drop-shadow(0 0 5px rgba(255,215,0,0.5))' : 'none'
                  }}
                />
              </g>
            ))}

            {/* Glowing Core */}
            <circle 
              cx="200" cy="180" r="18" 
              fill="#FDD835" 
              className="transition-all duration-1000"
              style={{ transform: isBloomed ? 'scale(1.3)' : 'scale(1)', transformOrigin: '200px 180px' }}
            />
            <circle cx="200" cy="180" r="10" fill="#FBC02D" opacity="0.5" />
          </g>
        </g>
      </svg>
      
      {/* Dynamic Glow Background */}
      <div className={`absolute left-1/2 top-[30%] -translate-x-1/2 w-96 h-96 bg-yellow-400 blur-[140px] rounded-full transition-opacity duration-1000 pointer-events-none ${isBloomed ? 'opacity-50' : 'opacity-20 animate-pulse'}`}></div>
      
      {/* Sparkles */}
      {isBloomed && (
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none">
           <div className="absolute animate-ping bg-yellow-200 w-5 h-5 rounded-full top-0 left-1/4 opacity-70"></div>
           <div className="absolute animate-pulse bg-white w-4 h-4 rounded-full top-1/2 right-0 opacity-90"></div>
           <div className="absolute animate-bounce bg-yellow-500 w-4 h-4 rounded-full bottom-0 left-1/3 opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default Rose;
