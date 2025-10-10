import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type Track = { url: string; title?: string } | null;

type AudioPlayerState = {
  track: Track;
  playing: boolean;
  setTrack: (t: Track) => void;
  play: (t?: Track) => void;
  pause: () => void;
};

const Ctx = createContext<AudioPlayerState | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = 'none';
      el.addEventListener('ended', () => setPlaying(false));
      audioRef.current = el;
    }
  }, []);

  const play = (t?: Track) => {
    const el = audioRef.current;
    if (!el) return;
    if (t && t.url !== track?.url) {
      setTrack(t);
      el.src = t.url;
    }
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const pause = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setPlaying(false);
  };

  return (
    <Ctx.Provider value={{ track, playing, setTrack, play, pause }}>
      {children}
      {/* hidden audio element for global playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Ctx.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};

