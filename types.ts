
export interface FloatingItem {
  id: number;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

export interface Sparkle {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  dx: string;
  dy: string;
  driftDuration: string;
}