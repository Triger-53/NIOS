
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
  context?: string;
}

const LiveOverlay: React.FC<LiveOverlayProps> = ({ onClose, context }) => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const volumeRef = useRef<number>(0);
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef(status); // Use a ref to track current status for cleanup

  // Keep the ref in sync with the state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
      // Final safety net: ensure disconnection on unmount
      if (statusRef.current === ConnectionState.CONNECTED) {
        clientRef.current?.disconnect();
      }
    };
  }, [addMessage, handleVolume]);

  const handleVideoError = useCallback((error: string) => {
    console.error("Video Error:", error);
    setVideoError("Camera not detected. Please check permissions and ensure your camera is not in use by another application.");
    setIsVideoActive(false); // Ensure video state is off
  }, []);

  const stopMicrophone = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
      console.log("Microphone stream stopped.");
    }
  };

  const handleToggleStart = async () => {
    // When stopping the session
    if (status === ConnectionState.CONNECTED) {
      clientRef.current?.disconnect();
      stopMicrophone();
      setIsVideoActive(false);
      setVideoError(null);
    } else {
      if (clientRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = stream;
          await clientRef.current.connect(stream, context);
        } catch (err) {
          console.error("Microphone Error:", err);
          setVideoError("Microphone access denied. Please check your browser permissions.");
        }
      }
    }
  };

  const handleClose = () => {
    if (status === ConnectionState.CONNECTED) {
      clientRef.current?.disconnect();
    }
    stopMicrophone(); // Explicitly stop the mic before closing.
    onClose();
  };

  const toggleVideo = () => {
    if (!isVideoActive) {
      setVideoError(null); // Clear previous errors when trying to turn on video
    }
    setIsVideoActive(prev => !prev);
  };

  const handleVideoFrame = useCallback((base64: string) => {
    if (status === ConnectionState.CONNECTED && clientRef.current) {
      clientRef.current.sendVideoFrame(base64);
    }
  }, [status]);

  // Header Component inline
  const Header = () => (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-rose-500" />
        <h1 className="text-lg font-medium tracking-wide text-white/90">LIVE TEACHER</h1>
      </div>
      <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
        <X className="w-6 h-6" />
      </button>
    </header>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Header />

      {/* Conditional Layout: Video ON */}
      {isVideoActive && (
        <main className="flex-1 flex flex-col pt-20">
          {/* Top half for Video */}
          <div className="relative flex-1 bg-black flex items-center justify-center">
            <VideoPreview
              isActive={isVideoActive}
              onFrame={handleVideoFrame}
              onError={handleVideoError}
            />
          </div>

          {/* Bottom half for Chat */}
          <div className="relative h-1/2 bg-slate-800 flex flex-col">
            <div className="flex-1 overflow-y-auto scroll-smooth p-4">
              <ChatLog messages={messages.filter(m => m.role !== 'system')} />
            </div>
          </div>
        </main>
      )}

      {/* Conditional Layout: Video OFF (Full-screen Chat) */}
      {!isVideoActive && (
        <main className="flex-1 relative z-10 flex flex-col pt-20">
          {/* Static Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950" />
          <div className="absolute inset-0 opacity-20 mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

          {/* Show Video Error if it exists */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center p-8 z-20">
              <div className="relative text-center bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-rose-500/50">
                <button onClick={() => setVideoError(null)} className="absolute top-2 right-2 p-1 rounded-full text-slate-300 hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-rose-400 mb-2">Camera Error</h3>
                <p className="text-slate-300 max-w-sm pt-2">{videoError}</p>
              </div>
            </div>
          )}

          {/* Full-screen Chat Log */}
          <div className={`relative flex-1 overflow-y-auto scroll-smooth pb-24 px-4 ${videoError ? 'opacity-20' : ''}`} >
            <ChatLog messages={messages.filter(m => m.role !== 'system')} />
          </div>
        </main>
      )}

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
