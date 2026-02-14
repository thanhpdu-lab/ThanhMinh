
import React, { useEffect } from 'react';
import { FloatingItem } from '../types';

interface FloatingElementProps {
  item: FloatingItem;
  audioContext: AudioContext | null;
  isMuted?: boolean;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ item, audioContext, isMuted }) => {
  useEffect(() => {
    if (!audioContext || isMuted) return;

    const playWishSound = () => {
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      // Randomize pitch slightly for a more "natural" magical feel
      const baseFreq = item.type === 'image' ? 600 : 800;
      const freq = baseFreq + Math.random() * 400;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.1, now + 0.1);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(now);
      osc.stop(now + 0.1);
    };

    // Delay the sound to match the CSS transition delay
    const timer = setTimeout(playWishSound, item.delay * 1000);
    return () => clearTimeout(timer);
  }, [audioContext, item.delay, item.type, isMuted]);

  return (
    <div
      className="absolute pointer-events-none transition-all duration-[3000ms] ease-out flex flex-col items-center justify-center"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) rotate(${item.rotation}deg) scale(${item.scale})`,
        opacity: 1,
        transitionDelay: `${item.delay}s`,
      }}
    >
      <div 
        className="animate-float-gentle" 
        style={{ 
          animationDelay: `${Math.random() * -5}s`,
          animationDuration: `${5 + Math.random() * 4}s`
        }}
      >
        {item.type === 'image' ? (
          <div className="p-2 bg-white shadow-2xl rounded-sm border-8 border-white transform rotate-3">
            <img 
              src={item.content} 
              alt="Memories" 
              className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-sm grayscale-[20%] hover:grayscale-0 transition-all"
            />
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-400/30 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <p className="text-yellow-100 font-cursive text-xl md:text-3xl whitespace-nowrap drop-shadow-lg">
              {item.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingElement;
