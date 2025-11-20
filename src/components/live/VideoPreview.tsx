
import React, { useEffect, useRef } from 'react';
import { blobToBase64 } from '@/lib/audioUtils';

interface VideoPreviewProps {
  isActive: boolean;
  onFrame: (base64: string) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ isActive, onFrame }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      const startVideo = async () => {
        try {
          // Use environment (rear) if available, but many users want selfie mode for "talking to AI"
          // Let's try to be smart: 'user' is better for face-to-face, 'environment' for showing things.
          // Since user said "Video Audio", let's default to environment as they likely want to show the world.
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user', // Changed to user for "FaceTime" feel, or toggleable in real app
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      };
      startVideo();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Frame capture loop (10 FPS)
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw frame without mirroring for the AI (AI needs to read text correctly)
          ctx.drawImage(video, 0, 0);

          canvas.toBlob(async (blob) => {
            if (blob) {
              const base64 = await blobToBase64(blob);
              onFrame(base64);
            }
          }, 'image/jpeg', 0.6);
        }
      }
    }, 100);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isActive, onFrame]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">
      <video
        ref={videoRef}
        muted
        playsInline
        // Mirror the video for the user so it feels natural (Selfie mirror)
        // Object-cover ensures it fills the screen
        className="w-full h-full object-cover transform -scale-x-100 opacity-90"
      />
      <canvas ref={canvasRef} className="hidden" />
      {/* Vignette overlay for cinematic focus */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/40" />
    </div>
  );
};

export default VideoPreview;
