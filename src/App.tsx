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
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [backgroundMusicPaused, setBackgroundMusicPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [marqueeDuration, setMarqueeDuration] = useState(12); // seconds
  const [showSongList, setShowSongList] = useState(false);

  const playlist = [
    {
      src: "/media/05. I Really Want to Stay at Your House.mp3",
      title: "I Really Wanna Stay At Your House"
    },
    {
      src: "/media/03. Who's Ready for Tomorrow.mp3", 
      title: "Who's Ready for Tomorrow"
    },
    {
      src: "/media/47. Let You Down.mp3",
      title: "Let You Down"
    },
    {
      src: "/media/17. Little Stranger.mp3",
      title: "Little Stranger"
    }
  ];

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Set up media session for better media key support
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playlist[currentSongIndex].title,
        artist: 'Cyberpunk 2077',
        album: 'Night City Arcade',
        artwork: [
          { src: '/media/pixel-jeff-clipa-s.gif', sizes: '96x96', type: 'image/gif' }
        ]
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
        setCurrentSongIndex(prevIndex);
        if (audioRef.current) {
          audioRef.current.src = playlist[prevIndex].src;
          audioRef.current.currentTime = 0;
          if (!muted && musicStarted) {
            audioRef.current.play();
          }
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', skipToNextSong);
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current && musicStarted) {
          audioRef.current.play();
          setMuted(false);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      });
    }

    // Add keyboard event listener for media keys
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'MediaTrackNext' || event.code === 'MediaTrackPrevious') {
        event.preventDefault();
        if (event.code === 'MediaTrackNext') {
          skipToNextSong();
        } else {
          const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
          setCurrentSongIndex(prevIndex);
          if (audioRef.current) {
            audioRef.current.src = playlist[prevIndex].src;
            audioRef.current.currentTime = 0;
            if (!muted && musicStarted) {
              audioRef.current.play();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSongIndex, muted, musicStarted]);

  useEffect(() => {
    // Update media session metadata when song changes
    if ('mediaSession' in navigator && musicStarted) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playlist[currentSongIndex].title,
        artist: 'Cyberpunk 2077',
        album: 'Night City Arcade',
        artwork: [
          { src: '/media/pixel-jeff-clipa-s.gif', sizes: '96x96', type: 'image/gif' }
        ]
      });
    }
  }, [currentSongIndex, musicStarted]);

  useEffect(() => {
    // Dynamically set marquee duration based on text width
    if (marqueeRef.current) {
      const marqueeWidth = marqueeRef.current.scrollWidth;
      // 80px/sec is a good speed; adjust as needed
      const duration = Math.max(6, marqueeWidth / 80);
      setMarqueeDuration(duration);
    }
  }, [currentSongIndex, playlist[currentSongIndex].title, musicStarted]);

  const pauseBackgroundMusic = () => {
    if (audioRef.current && !muted && musicStarted) {
      audioRef.current.pause();
      setBackgroundMusicPaused(true);
    }
  };

  const resumeBackgroundMusic = () => {
    if (audioRef.current && backgroundMusicPaused && !muted && musicStarted) {
      audioRef.current.play();
      setBackgroundMusicPaused(false);
    }
  };

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

  const skipToNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.src = playlist[nextIndex].src;
      audioRef.current.currentTime = 0;
      if (!muted && musicStarted) {
        audioRef.current.play();
      }
    }
  };

  const handleSongEnd = () => {
    skipToNextSong();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <audio
          ref={audioRef}
          src={playlist[currentSongIndex].src}
          autoPlay={musicStarted}
          loop={false}
          muted={muted || !musicStarted}
          onEnded={handleSongEnd}
        />
        {/* Song Selection Panel */}
        {musicStarted && !muted && showSongList && (
          <div
            className="fixed bottom-20 z-50 pixel-button border-cyber-blue bg-cyber-dark text-cyber-blue font-pixel text-base shadow-lg px-4 py-2 flex flex-col items-center sm:w-[320px] w-[90vw] max-w-md"
            style={{ left: '50%', transform: 'translateX(-50%)', borderRadius: 0, imageRendering: 'pixelated' }}
          >
            <div className="mb-2 text-cyber-pink text-lg">Select a Song</div>
            <ul className="w-full">
              {playlist.map((song, idx) => (
                <li key={song.title}>
                  <button
                    className={`w-full text-left px-2 py-2 rounded transition-colors ${idx === currentSongIndex ? 'bg-cyber-blue/20 text-cyber-pink' : 'hover:bg-cyber-blue/10 text-cyber-blue'}`}
                    onClick={() => {
                      setCurrentSongIndex(idx);
                      setShowSongList(false);
                      if (audioRef.current) {
                        audioRef.current.src = playlist[idx].src;
                        audioRef.current.currentTime = 0;
                        if (!muted && musicStarted) {
                          audioRef.current.play();
                        }
                      }
                    }}
                  >
                    {song.title}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-2 text-xs text-cyber-orange hover:underline"
              onClick={() => setShowSongList(false)}
            >
              Close
            </button>
          </div>
        )}
        {/* Now Playing Marquee Banner (laptop/desktop only) */}
        {musicStarted && !muted && (
          <div
            className="fixed bottom-6 z-50 pixel-button border-cyber-blue bg-cyber-dark text-cyber-blue font-pixel text-base shadow-lg px-4 py-2 flex items-center hidden sm:flex cursor-pointer"
            style={{
              right: '96px',
              minWidth: 180,
              maxWidth: 260,
              height: 44,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              borderRadius: 0,
              imageRendering: 'pixelated',
            }}
            onClick={() => setShowSongList((v) => !v)}
            title="Click to select a song"
          >
            <div
              ref={marqueeRef}
              style={{
                display: 'flex',
                whiteSpace: 'nowrap',
                minWidth: 'max-content',
                animation: `marquee ${marqueeDuration}s linear infinite`,
              }}
            >
              <span style={{ paddingRight: '2rem' }}>
                Now Playing: "{playlist[currentSongIndex].title}"
              </span>
              <span style={{ paddingRight: '2rem' }}>
                Now Playing: "{playlist[currentSongIndex].title}"
              </span>
            </div>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        )}
        {/* Pixelated floating music control button (always show Play Music until started) */}
        {!musicStarted ? (
          <button
            onClick={startMusic}
            className="fixed bottom-6 right-6 z-50 pixel-button border-cyber-purple bg-cyber-dark text-cyber-blue px-4 py-2 text-lg font-pixel shadow-lg hover:bg-cyber-purple/20 transition-all"
            style={{ imageRendering: 'pixelated' }}
          >
            <span role="img" aria-label="Play Music">🎵 PLAY MUSIC</span>
          </button>
        ) : (
          <button
            onClick={toggleMute}
            className="fixed bottom-6 right-6 z-50 pixel-button border-cyber-purple bg-cyber-dark text-cyber-blue px-4 py-2 text-lg font-pixel shadow-lg hover:bg-cyber-purple/20 transition-all"
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
            <Route path="/" element={
              <Index 
                pauseBackgroundMusic={pauseBackgroundMusic}
                resumeBackgroundMusic={resumeBackgroundMusic}
              />
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
