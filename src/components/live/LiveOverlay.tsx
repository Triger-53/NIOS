
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatLog from './ChatLog';
import VideoPreview from './VideoPreview';
import WaveCanvas from './WaveCanvas';
import ControlTray from './ControlTray';
import { GeminiLiveClient } from '@/lib/geminiLive';
import { ConnectionState, LogMessage } from '@/types/live-types';
import { X } from 'lucide-react';

interface LiveOverlayProps {
    onClose: () => void;
}

const LiveOverlay: React.FC<LiveOverlayProps> = ({ onClose }) => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isVideoActive, setIsVideoActive] = useState(false);

  const volumeRef = useRef<number>(0);
  const clientRef = useRef<GeminiLiveClient | null>(null);

  const addMessage = useCallback((role: 'user' | 'model' | 'system', text: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      role,
      text,
      timestamp: new Date()
    }]);
  }, []);

  const handleVolume = useCallback((vol: number) => {
    volumeRef.current = vol;
  }, []);

  useEffect(() => {
    clientRef.current = new GeminiLiveClient(
      addMessage,
      setStatus,
      handleVolume
    );
    return () => {
      clientRef.current?.disconnect();
    };
  }, [addMessage, handleVolume]);

  const handleToggleStart = async () => {
    if (status === ConnectionState.CONNECTED || status === ConnectionState.CONNECTING) {
        clientRef.current?.disconnect();
        setIsVideoActive(false);
        volumeRef.current = 0;
    } else {
        if (clientRef.current) {
            // Start with Video Active by default for the "Live" experience
            setIsVideoActive(true);
            await clientRef.current.connect();
        }
    }
  };

  const toggleVideo = () => {
      setIsVideoActive(!isVideoActive);
  };

  const handleVideoFrame = useCallback((base64: string) => {
    if (status === ConnectionState.CONNECTED && clientRef.current) {
      clientRef.current.sendVideoFrame(base64);
    }
  }, [status]);

  // Header Component inline
  const Header = () => (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]" />
        <h1 className="text-lg font-medium tracking-wide text-white/90">LIVE TEACHER</h1>
      </div>
      <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
          <X className="w-6 h-6" />
      </button>
    </header>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen bg-black text-slate-100 overflow-hidden font-sans">

      {/* Layer 0: Background */}
      <div className="absolute inset-0 z-0">
          {isVideoActive ? (
             <VideoPreview isActive={isVideoActive} onFrame={handleVideoFrame} />
          ) : (
             <>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950" />
                <div className="absolute inset-0 opacity-20 mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
             </>
          )}
      </div>

      {/* Layer 1: UI Elements */}
      <Header />

      {/* Layer 2: Main Interface */}
      <main className="flex-1 relative z-10 flex flex-col justify-between pointer-events-none">

        {/* Top Space for Video visibility */}
        <div className="flex-1" />

        {/* Chat Log Container (with mask to fade top) */}
        <div className="relative w-full max-h-[50vh] overflow-hidden pointer-events-auto">
             <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-transparent z-10" />

             <div className="h-full overflow-y-auto scroll-smooth pb-24 px-4 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                 <ChatLog messages={messages} />
             </div>
        </div>
      </main>

      {/* Layer 3: Visualizer (Behind Controls, Over Video) */}
      <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none z-20 flex items-end justify-center opacity-90">
          <WaveCanvas volumeRef={volumeRef} isActive={status === ConnectionState.CONNECTED} />
      </div>

      {/* Layer 4: Controls */}
      <ControlTray
        status={status}
        onToggle={handleToggleStart}
        isVideoActive={isVideoActive}
        onVideoToggle={toggleVideo}
      />

    </div>
  );
};

export default LiveOverlay;
