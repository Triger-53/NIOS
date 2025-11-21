
import React from 'react';
import { ConnectionState } from '@/types/live-types';

interface ControlTrayProps {
  status: ConnectionState;
  onToggle: () => void;
  isVideoActive: boolean;
  onVideoToggle?: () => void;
}

const ControlTray: React.FC<ControlTrayProps> = ({ status, onToggle, isVideoActive, onVideoToggle }) => {
  const isConnected = status === ConnectionState.CONNECTED;
  const isConnecting = status === ConnectionState.CONNECTING;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 z-50">

       {/* Mic / Audio Indicator */}
       <div className="relative group">
         <div className={`absolute inset-0 bg-blue-500/30 blur-lg rounded-full transition-opacity duration-500 ${isConnected ? 'opacity-100' : 'opacity-0'}`} />
         <button
           disabled={true} // Purely visual for now
           className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${isConnected ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/10 text-slate-500'}`}
         >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 9.303V21.75a.75.75 0 01-1.5 0v-2.25A6.751 6.751 0 015.25 12.75v-1.5a.75.75 0 01.75-.75z" />
           </svg>
         </button>
       </div>

       {/* Main Action Button */}
       <button
         onClick={onToggle}
         disabled={isConnecting}
         className={`relative h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center transition-all duration-500 transform active:scale-95 shadow-2xl ${
            isConnected
              ? 'bg-transparent border-4 border-rose-500'
              : 'bg-white hover:bg-slate-100 text-slate-900 shadow-black/20'
         } ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
       >
         {isConnected ? (
            // "Recording" indicator: a red circle inside the ring
            <div className="w-1/2 h-1/2 bg-rose-500 rounded-full" />
         ) : (
            <>
                {isConnecting ? (
                    <div className="w-7 h-7 md:w-8 md:h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                )}
            </>
         )}
       </button>

       {/* Video Toggle */}
       <div className="relative group">
          <div className={`absolute inset-0 bg-purple-500/30 blur-lg rounded-full transition-opacity duration-500 ${isVideoActive ? 'opacity-100' : 'opacity-0'}`} />
          <button
             onClick={onVideoToggle}
             className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${isVideoActive ? 'bg-white text-slate-900 border-white' : 'bg-black/40 border-white/10 text-white hover:bg-white/10'}`}
          >
            {isVideoActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
                    <path d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" />
                </svg>
            )}
          </button>
       </div>

    </div>
  );
};

export default ControlTray;
