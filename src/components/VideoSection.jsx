import React, { useState, useRef } from 'react';
import FadeInSection from './FadeInSection';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleOpen = () => setIsPlaying(true);
  const handleClose = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <FadeInSection as="section" className="py-20 bg-[#e6f0e4]" id="video-presentation">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-on-surface mb-3">
            Soutarah en Mouvement
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Des services de qualité dont de nombreux partenaires nationaux et internationaux témoignent au quotidien.
          </p>
        </div>

        {/* Video Thumbnail Container */}
        <div
          className="relative max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl group border border-gray-200 cursor-pointer"
          onClick={handleOpen}
        >
          {/* Native video as thumbnail (muted, paused, poster frame) */}
          <video
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://soutarahgroup.ci/video/car2.mp4"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 group-hover:bg-black/30 transition-colors duration-300"></div>

          {/* Play Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <button
              onClick={handleOpen}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-primary hover:bg-[#1b4c00] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
              aria-label="Lire la vidéo"
            >
              <span className="material-symbols-outlined text-4xl sm:text-5xl font-variation-fill pl-1 group-hover/btn:scale-110 transition-transform">
                play_arrow
              </span>
            </button>
            <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
              Découvrir notre présentation
            </span>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {isPlaying && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <video
              ref={videoRef}
              className="w-full h-full"
              src="https://soutarahgroup.ci/video/car2.mp4"
              controls
              autoPlay
              playsInline
              title="Présentation SOUTARAH GROUP"
            />
          </div>
        </div>
      )}
    </FadeInSection>
  );
}
