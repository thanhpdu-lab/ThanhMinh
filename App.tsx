
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Rose from './components/Rose';
import FloatingElement from './components/FloatingElement';
import { FloatingItem, Sparkle } from './types';

/** 
 * ============================================================
 * DANH SÁCH HÌNH ẢNH CỦA BẠN (TỰ THAY ĐỔI TẠI ĐÂY)
 * ============================================================
 * Bạn có thể thay thế các link bên dưới bằng link ảnh của mình.
 * Hỗ trợ: Link ảnh trực tiếp (.jpg, .png) hoặc link Google Drive.
 * Cách thêm: "link_anh_1", "link_anh_2", ...
 */
const MY_CUSTOM_IMAGES = [
  "https://i.ibb.co/spgLt53q/z7533332207121-f62d75e38414d6d53cba0069e81561fb.jpg",
  "https://i.ibb.co/pBNNzqJw/z7533331187481-286efb4ea4839ae5ec7ae94fd0a263f7.jpg",
  "https://i.ibb.co/bRJFCCT9/dsds.jpg",
  "https://i.ibb.co/NdzZMr7t/489339616-4088415501432949-1753548840950006002-n.jpg",
  "https://i.ibb.co/gLmYdcMv/481263088-4048216182119548-6150637390142351905-n.jpg",
  "https://i.ibb.co/ycZghwXX/484116536-4066307336977099-7878542733866138768-n.jpg",
  "https://i.ibb.co/60D8M75x/487860763-4084469288494237-3697710498857081950-n.jpg",
  // Dán thêm link của bạn vào đây...
];

// Danh sách lời chúc mặc định
const WISHES = [
  "Happy Valentine's Day 2026",
  "Be Smile",
  "Be Light",
  "Be Shine",
  "Be Mine",
  "Be Sweet",
  "Be Lucky",
  "Be Lovely",
  "Be Rich",
  "Chúc nụ cười em luôn rạng rỡ",
  "Chúc tim em đầy yêu thương",
  "Chúc ơn trên luôn che chở",
  "Trên mọi chặng đường",
];

// Nhạc nền nhẹ nhàng, lãng mạn
const BG_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808d304b3.mp3";

const App: React.FC = () => {
  const [isBloomed, setIsBloomed] = useState(false);
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const isQuotaExhausted = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // Hàm chuyển đổi link Google Drive sang link trực tiếp (viewable)
  const convertDriveLink = (url: string) => {
    const driveIdMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
    }
    return url;
  };

  // Chuẩn bị danh sách ảnh đã được xử lý link
  const PROCESSED_IMAGES = MY_CUSTOM_IMAGES.map(url => convertDriveLink(url));

  useEffect(() => {
    const audio = new Audio(BG_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;
    bgMusicRef.current = audio;
    return () => { audio.pause(); bgMusicRef.current = null; };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) bgMusicRef.current.muted = isMuted;
  }, [isMuted]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    if (bgMusicRef.current && bgMusicRef.current.paused) {
      bgMusicRef.current.play().catch(e => console.log("Music play blocked", e));
    }
  };

  const playBloomSound = () => {
    if (!audioContextRef.current || isMuted) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + i * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1200 + i * 300, now + 1.5);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + 1.5);
    }
  };

  useEffect(() => {
    const newSparkles: Sparkle[] = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
      dx: `${(Math.random() - 0.5) * 40}px`,
      dy: `${(Math.random() - 0.5) * 40}px`,
      driftDuration: `${Math.random() * 10 + 10}s`,
    }));
    setSparkles(newSparkles);
  }, []);

  const fetchExtraWishes = useCallback(async () => {
    if (isQuotaExhausted.current) return WISHES;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Hãy tạo 15 lời chúc mừng ngắn gọn, lãng mạn, sang trọng bằng tiếng Việt dành cho một người phụ nữ tuyệt vời. Trả về dưới dạng JSON list của các string.",
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      const generated = JSON.parse(response.text || "[]") as string[];
      return generated.length > 0 ? [...new Set([...WISHES, ...generated])] : WISHES;
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) isQuotaExhausted.current = true;
      return WISHES;
    }
  }, []);

  const handleBloom = async () => {
    initAudio();
    if (isBloomed) {
      setIsBloomed(false);
      setFloatingItems([]);
      return;
    }

    playBloomSound();
    setIsBloomed(true);
    const extraWishes = await fetchExtraWishes();
    
    const items: FloatingItem[] = [];
    const count = 35; 
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
      const distance = 350 + Math.random() * 550; 
      const isImage = Math.random() > 0.6; 
      
      let itemContent = "";
      if (isImage) {
        if (PROCESSED_IMAGES.length > 0) {
          itemContent = PROCESSED_IMAGES[Math.floor(Math.random() * PROCESSED_IMAGES.length)];
        } else {
          itemContent = `https://picsum.photos/400/400?random=${i + 300}`;
        }
      } else {
        itemContent = extraWishes[Math.floor(Math.random() * extraWishes.length)];
      }
      
      items.push({
        id: i,
        type: isImage ? 'image' : 'text',
        content: itemContent,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: (Math.random() - 0.5) * 80,
        scale: 0.6 + Math.random() * 0.8,
        delay: i * 0.04
      });
    }
    setFloatingItems(items);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Sparkles */}
      {sparkles.map(s => (
        <div key={s.id} className="sparkle-particle" style={{
            top: s.top, left: s.left, width: s.size, height: s.size,
            '--duration': s.duration, '--delay': s.delay, '--dx': s.dx, '--dy': s.dy, '--drift-duration': s.driftDuration
          } as any}
        />
      ))}

      {/* Control Buttons */}
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 transition-all text-yellow-100/70 hover:text-yellow-400 backdrop-blur-sm shadow-xl"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          )}
        </button>
      </div>

      {/* Ambient Lighting */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1500 ${isBloomed ? 'opacity-40' : 'opacity-10'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] animate-breathe bg-[radial-gradient(circle_at_center,_rgba(255,235,59,0.2)_0%,_transparent_70%)]"></div>
      </div>

      {/* Floating Elements Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isBloomed && floatingItems.map(item => (
          <FloatingElement key={item.id} item={item} audioContext={audioContextRef.current} isMuted={isMuted} />
        ))}
      </div>

      {/* Header Overlay */}
      <div className={`absolute top-12 text-center transition-all duration-1000 transform z-20 ${isBloomed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-600 font-bold drop-shadow-[0_2px_20px_rgba(255,235,59,0.5)]">
          Be Smile, Be Shine
        </h1>
        <p className="text-yellow-100/80 font-cursive text-2xl mt-4 italic drop-shadow-md">
          Happy Valentine's Day 2026...
        </p>
      </div>

      {/* The Central Rose */}
      <div className="z-10 relative">
        <Rose isBloomed={isBloomed} onClick={handleBloom} />
      </div>

      {/* Instructions */}
      {!isBloomed && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-30 pointer-events-none">
          <div className="relative px-10 py-5 bg-[#fcf5e5] shadow-[5px_5px_15px_rgba(0,0,0,0.5)] transform -rotate-2 border border-[#e5dec9] rounded-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/30 backdrop-blur-sm rotate-1 border border-white/20"></div>
            <p className="text-amber-900 font-cursive text-2xl md:text-4xl tracking-wide relative">
              Hãy click vào bông hoa
            </p>
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
          </div>
        </div>
      )}

      {/* Reset Control */}
      {isBloomed && (
        <button 
          onClick={() => { setIsBloomed(false); setFloatingItems([]); }}
          className="absolute bottom-12 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-200 px-12 py-4 rounded-full border border-yellow-400/40 transition-all text-sm uppercase tracking-[0.2em] z-30 backdrop-blur-md active:scale-95 shadow-xl"
        >
          Trở lại nụ hoa
        </button>
      )}
    </div>
  );
};

export default App;
