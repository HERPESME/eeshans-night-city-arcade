import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useRef, useState, useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const startMusic = () => {
    setMusicStarted(true);
    setMuted(false);
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play();
    }
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const newMuted = !prev;
      if (audioRef.current) audioRef.current.muted = newMuted;
      return newMuted;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <audio
          ref={audioRef}
          src={"/lovable-uploads/05. I Really Want to Stay at Your House.mp3"}
          autoPlay={musicStarted}
          loop
          muted={muted || !musicStarted}
        />
        {/* Pixelated floating music control button (always show Play Music until started) */}
        {!musicStarted ? (
          <button
            onClick={startMusic}
            className="fixed bottom-6 right-6 z-50 pixel-button border-cyber-blue bg-cyber-dark text-cyber-blue px-4 py-2 text-lg font-pixel shadow-lg hover:bg-cyber-blue/20 transition-all"
            style={{ imageRendering: 'pixelated' }}
          >
            <span role="img" aria-label="Play Music">🎵 PLAY MUSIC</span>
          </button>
        ) : (
          <button
            onClick={toggleMute}
            className="fixed bottom-6 right-6 z-50 pixel-button border-cyber-blue bg-cyber-dark text-cyber-blue px-4 py-2 text-lg font-pixel shadow-lg hover:bg-cyber-blue/20 transition-all"
            style={{ imageRendering: 'pixelated' }}
          >
            {muted ? (
              <span role="img" aria-label="Unmute">🔇</span>
            ) : (
              <span role="img" aria-label="Mute">🔊</span>
            )}
          </button>
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
