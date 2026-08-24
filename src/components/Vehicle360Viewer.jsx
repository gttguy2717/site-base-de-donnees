import React, { useEffect, useRef, useState } from 'react';

/**
 * Vehicle360Viewer — Aperçu 360° interactif du véhicule.
 * Permet de faire tourner la voiture sur elle-même en glissant
 * horizontalement (souris / tactile), avec rotation automatique.
 */
export default function Vehicle360Viewer({ vehicle, compact = false }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartRef = useRef({ x: 0, rotation: 0 });
  const autoRotateRef = useRef(null);
  const rotationRef = useRef(0);

  // Garde la rotation à jour dans la ref pour l'auto-rotation
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  // Rotation automatique quand active et non survolé / non glissé
  useEffect(() => {
    if (!autoRotate || isDragging || isHovered) return undefined;

    autoRotateRef.current = setInterval(() => {
      setRotation((prev) => (prev + 0.6) % 360);
    }, 30);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [autoRotate, isDragging, isHovered]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      rotation: rotationRef.current,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const sensitivity = compact ? 0.5 : 0.35;
    const newRotation = (dragStartRef.current.rotation + dx * sensitivity) % 360;
    setRotation(newRotation < 0 ? newRotation + 360 : newRotation);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => {
    setAutoRotate(false);
    setRotation((prev) => (prev - 15 + 360) % 360);
  };

  const handleRotateRight = () => {
    setAutoRotate(false);
    setRotation((prev) => (prev + 15) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setAutoRotate(true);
  };

  const toggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  // Calcul des effets visuels basés sur la rotation
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  // L'image "frontale" est à 0°, on simule le profil à 90°/270° et l'arrière à 180°
  const frontFactor = Math.max(0, Math.cos((normalizedRotation * Math.PI) / 180));
  const sideFactor = Math.abs(Math.sin((normalizedRotation * Math.PI) / 180));

  // Ombre portée qui se déplace avec la rotation
  const shadowOffset = Math.sin((normalizedRotation * Math.PI) / 180) * 14;
  const shadowScale = 0.85 + sideFactor * 0.15;

  // Reflet lumineux qui balaie la carrosserie
  const lightPosition = ((normalizedRotation / 360) * 100) % 100;

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full select-none flex-col items-center justify-center overflow-hidden ${
        compact ? 'h-full min-h-[220px]' : 'h-full min-h-[280px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
    >
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b16] via-[#143e22] to-[#09220f]" />
      <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#69c33b]/10 blur-3xl" />

      {/* Sol / plateforme */}
      <div className="absolute bottom-6 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-md" />

      {/* Zone 3D interactive */}
      <div
        className="relative z-10 flex h-full w-full cursor-grab items-center justify-center touch-none active:cursor-grabbing"
        style={{ perspective: '1200px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transform: `rotateY(${normalizedRotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Image du véhicule */}
          <div className="relative" style={{ transform: 'translateZ(0px)' }}>
            <img
              src={vehicle.image}
              alt={vehicle.name}
              draggable={false}
              className={`pointer-events-none object-contain drop-shadow-2xl ${
                compact ? 'max-h-[180px] w-auto' : 'max-h-[240px] w-auto'
              }`}
              style={{
                filter: `brightness(${0.75 + frontFactor * 0.35}) saturate(${0.9 + frontFactor * 0.2})`,
                transform: `scaleX(${0.92 + frontFactor * 0.08})`,
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x400/143e22/ffffff?text=Image+non+disponible';
              }}
            />
            {/* Reflet lumineux mobile */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(105deg, transparent ${lightPosition}%, rgba(255,255,255,0.18) ${lightPosition + 8}%, transparent ${lightPosition + 18}%)`,
                mixBlendMode: 'overlay',
              }}
            />
          </div>

          {/* Ombre dynamique */}
          <div
            className="pointer-events-none absolute -bottom-4 left-1/2 h-4 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-md"
            style={{
              transform: `translateX(${shadowOffset}px) scaleX(${shadowScale})`,
            }}
          />
        </div>
      </div>

      {/* Badge 360° */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <span className="material-symbols-outlined text-sm text-emerald-300">360</span>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white">Vue 360°</span>
      </div>

      {/* Indicateur de rotation */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <span className="material-symbols-outlined text-sm text-emerald-300">rotate_right</span>
        <span className="text-[10px] font-black text-white">{Math.round(normalizedRotation)}°</span>
      </div>

      {/* Contrôles */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/20 bg-black/50 p-1.5 backdrop-blur-md">
        <button
          onClick={handleRotateLeft}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90"
          aria-label="Tourner à gauche"
          title="Tourner à gauche"
        >
          <span className="material-symbols-outlined text-base">rotate_left</span>
        </button>

        <button
          onClick={toggleAutoRotate}
          className={`flex h-8 items-center justify-center gap-1 rounded-xl px-2.5 text-[10px] font-black uppercase tracking-wider transition-all active:scale-90 ${
            autoRotate ? 'bg-emerald-500/80 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          aria-label={autoRotate ? 'Arrêter la rotation automatique' : 'Activer la rotation automatique'}
          title={autoRotate ? 'Rotation auto : active' : 'Rotation auto : inactive'}
        >
          <span className="material-symbols-outlined text-sm">{autoRotate ? 'pause' : 'play_arrow'}</span>
          Auto
        </button>

        <button
          onClick={handleRotateRight}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90"
          aria-label="Tourner à droite"
          title="Tourner à droite"
        >
          <span className="material-symbols-outlined text-base">rotate_right</span>
        </button>

        <div className="mx-0.5 h-6 w-px bg-white/20" />

        <button
          onClick={handleReset}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90"
          aria-label="Réinitialiser la vue"
          title="Réinitialiser"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
        </button>
      </div>

      {/* Indication glisser */}
      <div className="pointer-events-none absolute bottom-14 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
        <span className="text-[10px] font-semibold text-white/80">
          <span className="material-symbols-outlined text-xs align-middle">swipe</span>
          {' '}Glissez pour faire tourner le véhicule
        </span>
      </div>
    </div>
  );
}