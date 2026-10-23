import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  ExternalLink,
  Sparkles,
  Disc3
} from 'lucide-react';

export const AmbientAudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(60);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // YouTube Video ID from user link: https://youtu.be/AnZ9hG0A_5A
  const videoId = 'AnZ9hG0A_5A';

  const sendIframeCommand = (command: string, args: any = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command,
          args: args,
        }),
        '*'
      );
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendIframeCommand('playVideo');
      setIsPlaying(true);
      sendIframeCommand('setVolume', [volume]);
      if (isMuted) {
        sendIframeCommand('unMute');
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      sendIframeCommand('unMute');
      setIsMuted(false);
    } else {
      sendIframeCommand('mute');
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sendIframeCommand('setVolume', [newVol]);
    if (newVol > 0 && isMuted) {
      sendIframeCommand('unMute');
      setIsMuted(false);
    }
  };

  // Listen for YouTube iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            setPlayerReady(true);
            sendIframeCommand('setVolume', [volume]);
          } else if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playerState === 1) {
              setIsPlaying(true);
            } else if (data.info.playerState === 2 || data.info.playerState === 0) {
              setIsPlaying(false);
            }
          }
        }
      } catch {
        // Ignore non-json postMessages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [volume]);

  return (
    <>
      {/* Hidden off-screen YouTube iframe for background audio streaming */}
      <div className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none">
        <iframe
          ref={iframeRef}
          id="yt-ambient-player"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&version=3&loop=1&playlist=${videoId}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          title="Senandung Syahdu MIN 1 Paser"
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>

      {/* Floating Unobtrusive Widget in Bottom Right */}
      <aside aria-label="Pemutar Audio Musik Syahdu" className="fixed bottom-5 right-5 z-40 select-none">
        {isExpanded ? (
          /* Expanded Player Panel */
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-200 p-3.5 w-72 text-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Music className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-emerald-950">
                  Senandung Syahdu
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                title="Perkecil Panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-1">
              <p className="text-[11px] font-semibold text-gray-800 line-clamp-1">
                Senandung Syahdu Penyejuk Hati
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                MIN 1 Paser • Suasana Damai
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 my-2.5">
              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/30 transition transform active:scale-95"
                title={isPlaying ? 'Jeda Lagu' : 'Putar Senandung'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>

            {/* Volume bar */}
            <div className="flex items-center gap-2 px-1 text-xs text-gray-500">
              <button
                onClick={handleToggleMute}
                className="text-gray-500 hover:text-gray-800 transition"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] w-6 text-right">
                {isMuted ? '0' : volume}%
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Audio Latar Terintegrasi</span>
              </span>
              <a
                href="https://youtu.be/AnZ9hG0A_5A"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-0.5"
                title="Buka sumber asli YouTube"
              >
                <span>Sumber</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Collapsed Floating Pill */
          <div className="flex items-center bg-white/90 hover:bg-white backdrop-blur-md border border-emerald-200 shadow-md rounded-full pl-2.5 pr-2 py-1.5 gap-2 transition hover:shadow-lg">
            <button
              onClick={handleTogglePlay}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-xs ${
                isPlaying 
                  ? 'bg-emerald-700 text-white animate-spin-slow' 
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
              title={isPlaying ? 'Jeda Senandung' : 'Putar Senandung Syahdu'}
            >
              {isPlaying ? (
                <Disc3 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsExpanded(true)}
              className="text-left text-xs font-semibold text-emerald-950 flex items-center gap-1.5 pr-1 cursor-pointer"
              title="Buka Pengaturan Audio"
            >
              <span>{isPlaying ? 'Senandung Syahdu' : 'Musik Syahdu'}</span>
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
