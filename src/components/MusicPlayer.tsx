import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RadioReceiver, Music, AudioLines } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Free to use electronic/synth loops for the dummy AI generated music experience
const TRACKS = [
  { 
    id: 1, 
    title: 'Neon Pulse (AI Gen)', 
    artist: 'Neural Network 9', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
  },
  { 
    id: 2, 
    title: 'Cybernetic Dreams (AI Gen)', 
    artist: 'DeepMind DJ', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' 
  },
  { 
    id: 3, 
    title: 'Digital Horizon (AI Gen)', 
    artist: 'SynthBot 3000', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' 
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Auto-play when track changes, if we were already playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => {
            console.log("Audio playback was prevented:", e);
            setIsPlaying(false);
        });
    }
  }, [currentTrackIndex]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => {
                console.log("Audio playback prevented:", e);
            });
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
      if (audioRef.current) {
          setDuration(audioRef.current.duration);
      }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
        setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (timeInSeconds: number) => {
      if (isNaN(timeInSeconds)) return "0:00";
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
      
      {/* Visualizer / Thumbnail */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 bg-[#0a0a0a] rounded border border-white/10 flex items-center justify-center overflow-hidden p-2 shadow-[0_0_10px_rgba(255,0,255,0.1)]">
         <AnimatePresence mode="popLayout">
            {isPlaying ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-end justify-between px-2 pb-2 gap-0.5"
                >
                    {[1, 2, 3, 4, 5].map((bar) => (
                        <motion.div 
                            key={bar}
                            className="flex-1 bg-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff] opacity-80"
                            animate={{ 
                                height: ["20%", "80%", "40%", "90%", "30%"],
                                opacity: [0.5, 1, 0.7, 1, 0.6]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.8 + (bar * 0.1),
                                ease: "easeInOut",
                                repeatType: "reverse"
                            }}
                        />
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <AudioLines className="w-8 h-8 text-white/20" />
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Track Info */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
        <p className="text-xs font-bold text-white uppercase truncate w-full">
          {currentTrack.title}
        </p>
        <p className="text-[10px] text-[#00ff41] uppercase tracking-tighter truncate w-full mb-2">
          {currentTrack.artist}
        </p>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-white/40 font-mono tabular-nums">{formatTime(currentTime)}</span>
            <input
                type="range"
                min="0"
                max="100"
                value={progress || 0}
                onChange={handleProgressChange}
                className="flex-1 h-1 bg-white/10 relative appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#ff00ff] [&::-webkit-slider-thumb]:shadow-[0_0_8px_#ff00ff] cursor-pointer"
            />
            <span className="text-[10px] text-white/40 font-mono tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <button 
                onClick={handlePrev}
                className="text-white/40 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            
            <button 
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full border-2 border-[#ff00ff] flex items-center justify-center text-[#ff00ff] hover:bg-[#ff00ff]/10 transition-all active:scale-95 bg-transparent"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>
            
            <button 
                onClick={handleNext}
                className="text-white/40 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>
          
          {/* Audio Volume */}
          <div className="hidden md:flex items-center gap-2 group">
              <button onClick={toggleMute} className="text-white/40 group-hover:text-[#00ff41] transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/10 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00ff41] cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
              />
          </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
}
