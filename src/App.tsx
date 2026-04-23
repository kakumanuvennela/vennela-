import React from 'react';
import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-mono relative overflow-hidden border-[#0a0a0a] selection:bg-[#ff00ff]/30 sm:border-4">
      
      {/* Retro CRT Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Header / Navigation Bar */}
      <header className="relative z-10 w-full h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]">
         <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-[#00ff41] shadow-[0_0_10px_#00ff41]"></div>
            <h1 className="text-xl font-bold tracking-tighter uppercase text-[#00ff41]">NeonSync // System_OS</h1>
         </div>
         
         <div className="hidden sm:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] text-white/50">
             <span>CPU: 42%</span>
             <span>BPM: 128</span>
             <span className="text-[#ff00ff]">Status: Synced</span>
         </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area: Game */}
        <main className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,_#111_0%,_#050505_100%)] p-4">
           <SnakeGame />
        </main>
      </div>

      {/* Footer: Music Controls */}
      <footer className="relative z-20 w-full h-auto sm:h-24 border-t border-white/10 bg-[#0a0a0a] flex items-center px-4 sm:px-12 py-4 sm:py-0 gap-6 sm:gap-12 backdrop-blur-none shadow-none">
        <MusicPlayer />
      </footer>
    </div>
  );
}
