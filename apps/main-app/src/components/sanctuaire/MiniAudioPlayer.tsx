import React from 'react';
import { Pause, Play } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

const MiniAudioPlayer: React.FC = () => {
  const { track, playing, play, pause } = useAudioPlayer();
  if (!track) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-[600px]">
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
        <div className="truncate text-white/80 text-sm">{track.title || 'Lecture audio'}</div>
        <button
          onClick={() => (playing ? pause() : play())}
          className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 hover:bg-amber-400/30"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default MiniAudioPlayer;

